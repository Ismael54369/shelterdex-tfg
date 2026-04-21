// ==========================================
// SCRIPT DE MIGRACIÓN: uploads locales → Cloudinary
// ==========================================
// Ejecutar UNA SOLA VEZ desde la carpeta backend/:
//   node migrar-cloudinary.js
//
// Qué hace:
// 1. Lee todas las rutas de imágenes de la BD (tablas animales + imagenes_animales)
// 2. Sube cada archivo local a Cloudinary
// 3. Actualiza la ruta en la BD con la URL de Cloudinary
// 4. Muestra un resumen al final

import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar BD
const sslConfig = process.env.DB_SSL === 'true'
  ? {
      ssl: {
        rejectUnauthorized: true,
        ca: fs.existsSync(path.join(__dirname, 'ca.pem'))
          ? fs.readFileSync(path.join(__dirname, 'ca.pem'))
          : undefined,
      },
    }
  : {};

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ...sslConfig,
});

const UPLOADS_DIR = path.join(__dirname, 'uploads');

let subidas = 0;
let errores = 0;
let yaEnCloudinary = 0;

async function subirACloudinary(rutaLocal) {
  // rutaLocal viene como "/uploads/1776155576848.jpg"
  // Construimos la ruta absoluta al archivo en disco
  const nombreArchivo = rutaLocal.replace('/uploads/', '');
  const archivoEnDisco = path.join(UPLOADS_DIR, nombreArchivo);

  if (!fs.existsSync(archivoEnDisco)) {
    console.warn(`  ⚠️  Archivo no encontrado en disco: ${archivoEnDisco}`);
    errores++;
    return null;
  }

  try {
    const resultado = await cloudinary.uploader.upload(archivoEnDisco, {
      folder: 'shelterdex',
      transformation: [{ width: 1200, crop: 'limit' }],
    });
    subidas++;
    return resultado.secure_url;
  } catch (err) {
    console.error(`  ❌ Error al subir ${nombreArchivo}:`, err.message);
    errores++;
    return null;
  }
}

async function migrar() {
  console.log('');
  console.log('🚀 Iniciando migración de imágenes a Cloudinary...');
  console.log(`   Carpeta local: ${UPLOADS_DIR}`);
  console.log('');

  // --- 1. Migrar tabla imagenes_animales ---
  console.log('📸 Procesando tabla imagenes_animales...');
  const [imagenes] = await db.query('SELECT id, ruta FROM imagenes_animales');

  for (const img of imagenes) {
    if (img.ruta && img.ruta.startsWith('http')) {
      yaEnCloudinary++;
      continue; // Ya está en Cloudinary
    }

    process.stdout.write(`   [${img.id}] ${img.ruta} → `);
    const urlCloudinary = await subirACloudinary(img.ruta);

    if (urlCloudinary) {
      await db.query('UPDATE imagenes_animales SET ruta = ? WHERE id = ?', [urlCloudinary, img.id]);
      console.log(`✅ ${urlCloudinary}`);
    } else {
      console.log('❌ No se pudo migrar');
    }
  }

  // --- 2. Migrar columna imagen de tabla animales ---
  console.log('');
  console.log('🐾 Procesando columna imagen de tabla animales...');
  const [animales] = await db.query('SELECT id, nombre, imagen FROM animales WHERE imagen IS NOT NULL');

  for (const animal of animales) {
    if (animal.imagen && animal.imagen.startsWith('http')) {
      yaEnCloudinary++;
      continue; // Ya está en Cloudinary
    }

    process.stdout.write(`   [${animal.id}] ${animal.nombre}: ${animal.imagen} → `);

    // Buscar si ya subimos esta imagen en el paso anterior (puede ser la misma foto de portada)
    const [yaSubida] = await db.query(
      'SELECT ruta FROM imagenes_animales WHERE animal_id = ? AND es_portada = 1 AND ruta LIKE ?',
      [animal.id, 'https://%']
    );

    if (yaSubida.length > 0) {
      // Ya la tenemos en Cloudinary desde el paso anterior, reutilizamos
      await db.query('UPDATE animales SET imagen = ? WHERE id = ?', [yaSubida[0].ruta, animal.id]);
      console.log(`✅ (reutilizada) ${yaSubida[0].ruta}`);
    } else {
      // Subir directamente
      const urlCloudinary = await subirACloudinary(animal.imagen);
      if (urlCloudinary) {
        await db.query('UPDATE animales SET imagen = ? WHERE id = ?', [urlCloudinary, animal.id]);
        console.log(`✅ ${urlCloudinary}`);
      } else {
        console.log('❌ No se pudo migrar');
      }
    }
  }

  // --- Resumen ---
  console.log('');
  console.log('═══════════════════════════════════');
  console.log(`✅ Subidas exitosas:     ${subidas}`);
  console.log(`⚠️  Ya en Cloudinary:     ${yaEnCloudinary}`);
  console.log(`❌ Errores:              ${errores}`);
  console.log('═══════════════════════════════════');
  console.log('');

  if (errores === 0) {
    console.log('🎉 ¡Migración completada sin errores!');
    console.log('   Puedes verificar en: https://console.cloudinary.com/console');
  } else {
    console.log('⚠️  Hubo errores. Revisa los archivos que no se encontraron.');
  }

  await db.end();
  process.exit(0);
}

migrar().catch(err => {
  console.error('Error fatal en la migración:', err);
  process.exit(1);
});
