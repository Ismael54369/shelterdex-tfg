import express from 'express';
import cors from 'cors';
import db from './db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Client, Environment, OrdersController } from '@paypal/paypal-server-sdk';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const app = express();

// Middlewares
const corsOptions = process.env.FRONTEND_URL
  ? { origin: process.env.FRONTEND_URL, credentials: true }
  : { origin: '*' };
app.use(cors(corsOptions));
app.use(express.json());

// Servir la carpeta de imágenes como ruta pública (solo útil en desarrollo local)
app.use('/uploads', express.static('uploads'));

// ==========================================
// CONFIGURACIÓN DE IMÁGENES (Multer + Cloudinary)
// ==========================================
// Si las credenciales de Cloudinary están configuradas, las imágenes se suben a la nube.
// Si no, se guardan en disco local (modo desarrollo con XAMPP).

const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

let upload;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const cloudStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'shelterdex',           // Carpeta en Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit' }],  // Limitar ancho para no gastar cuota
    },
  });

  upload = multer({ storage: cloudStorage, limits: { fileSize: 5 * 1024 * 1024 } });
  console.log('[Cloudinary] Imágenes se subirán a la nube.');
} else {
  // Modo local: guardar en disco
  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
      const nombreUnico = Date.now() + path.extname(file.originalname);
      cb(null, nombreUnico);
    }
  });

  const filtroImagenes = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (tiposPermitidos.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG, PNG o WebP.'), false);
  };

  upload = multer({ storage: localStorage, fileFilter: filtroImagenes, limits: { fileSize: 5 * 1024 * 1024 } });
  console.log('[Imágenes] Modo local: guardando en carpeta uploads/.');
}

// Helper: obtener la URL/ruta de un archivo subido.
// En Cloudinary: req.file.path es la URL completa (https://res.cloudinary.com/...)
// En local: construimos la ruta relativa /uploads/nombre.jpg
function obtenerRutaImagen(file) {
  if (!file) return null;
  if (useCloudinary) return file.path;       // URL completa de Cloudinary
  return `/uploads/${file.filename}`;         // Ruta relativa local
}

// Helper: extraer el public_id de Cloudinary desde una URL para poder borrar la imagen.
// Ejemplo: "https://res.cloudinary.com/xxx/image/upload/v123/shelterdex/abc123.jpg"
//       → "shelterdex/abc123"
function obtenerPublicId(url) {
  if (!url || !url.includes('cloudinary.com')) return null;
  const partes = url.split('/upload/');
  if (partes.length < 2) return null;
  const despuesDeUpload = partes[1]; // "v123/shelterdex/abc123.jpg"
  // Quitar la versión (v123/) si existe
  const sinVersion = despuesDeUpload.replace(/^v\d+\//, '');
  // Quitar la extensión
  return sinVersion.replace(/\.[^.]+$/, '');
}

// ==========================================
// CLIENTE PAYPAL (SDK oficial)
// ==========================================
// Lee credenciales desde .env. Si faltan, el servidor arranca igual
// pero los endpoints de PayPal devolverán error — esto permite desarrollar
// otras partes sin tener que configurar PayPal aún.
const paypalClient = (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
  ? new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID,
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
      },
      environment: process.env.PAYPAL_ENVIRONMENT === 'live' 
        ? Environment.Production 
        : Environment.Sandbox,
    })
  : null;

const paypalOrdersController = paypalClient ? new OrdersController(paypalClient) : null;

if (!paypalClient) {
  console.warn('[PayPal] Credenciales no configuradas. Los endpoints /api/paypal/* devolverán 503.');
} else {
  console.log(`[PayPal] Cliente inicializado en modo ${process.env.PAYPAL_ENVIRONMENT || 'sandbox'}.`);
}

// ==========================================
// MIDDLEWARES DE SEGURIDAD (JWT)
// ==========================================

// Middleware que verifica que el usuario tiene un token válido
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // El header viene como "Bearer <token>", extraemos solo el token
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token de autenticación.' });
  }

  try {
    // jwt.verify lanza un error si el token es inválido o ha expirado
    const datosUsuario = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = datosUsuario; // Guardamos los datos del usuario (id, rol, nombre) para usarlos en la ruta
    next(); // Continuamos a la siguiente función (la ruta real)
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

// Middleware que verifica que además de estar logueado, el usuario es Admin
const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

// ==========================================
// RUTAS DE LA API (Endpoints)
// ==========================================

// RUTA 1: Obtener todos los animales (READ - GET)
app.get('/api/animales', async (req, res) => {
  try {
    // Hacemos la consulta SQL a nuestra tabla
    const [filas] = await db.query('SELECT * FROM animales');
    
    // Enviamos el resultado al Frontend en formato JSON
    res.json(filas);
    
  } catch (error) {
    console.error('Error al obtener animales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTA 1b: Obtener UN animal por ID (READ - GET)
app.get('/api/animales/:id', async (req, res) => {
  try {
    const [filas] = await db.query('SELECT * FROM animales WHERE id = ?', [req.params.id]);
    
    if (filas.length === 0) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }
    
    res.json(filas[0]);
  } catch (error) {
    console.error('Error al obtener animal:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTA 2: Borrar un animal (DELETE)
app.delete('/api/animales/:id', verificarToken, verificarAdmin, async (req, res) => {  try {
    const idAnimal = req.params.id;
    
    // Ejecutamos la consulta SQL para borrar
    const [resultado] = await db.query('DELETE FROM animales WHERE id = ?', [idAnimal]);
    
    // Si affectedRows es 0, significa que el ID no existía
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }
    
    res.json({ mensaje: 'Animal borrado correctamente de la Base de Datos' });
    
  } catch (error) {
    console.error('Error al borrar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTA 3: Añadir un nuevo animal (CREATE - POST) — Ahora con imagen opcional
app.post('/api/animales', verificarToken, verificarAdmin, upload.single('imagen'), async (req, res) => {  try {
    const { nombre, especie, edad, peso, energia, sociabilidad, emoji, descripcion } = req.body;
    
    // Si se subió una imagen, guardamos la ruta relativa; si no, queda NULL
    const rutaImagen = obtenerRutaImagen(req.file);
    
    const sql = `
      INSERT INTO animales 
      (nombre, especie, edad, peso, energia, sociabilidad, emoji, imagen, descripcion, estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Refugio')
    `;
    
    const [resultado] = await db.query(sql, [
      nombre, 
      especie, 
      edad, 
      peso, 
      energia || 50,
      sociabilidad || 50, 
      emoji || '🐾',
      rutaImagen,
      descripcion
    ]);
    
    res.status(201).json({ 
      mensaje: 'Animal añadido con éxito', 
      id: resultado.insertId,
      imagen: rutaImagen
    });
    
  } catch (error) {
    console.error('Error al insertar:', error);
    res.status(500).json({ error: 'Error interno al guardar en la base de datos' });
  }
});

// RUTA 4: Actualizar un animal existente (UPDATE - PUT) — Ahora con imagen opcional
app.put('/api/animales/:id', verificarToken, verificarAdmin, upload.single('imagen'), async (req, res) => {  try {
    const idAnimal = req.params.id;
    const { nombre, especie, edad, peso, energia, sociabilidad, emoji, descripcion, estado } = req.body;
    
    // Si se sube nueva imagen, usamos la nueva ruta; si no, mantenemos la que ya tenía
    let rutaImagen = req.body.imagenExistente || null;
    if (req.file) {
      rutaImagen = obtenerRutaImagen(req.file);
    }
    
    const sql = `
      UPDATE animales 
      SET nombre = ?, especie = ?, edad = ?, peso = ?, energia = ?, sociabilidad = ?, emoji = ?, imagen = ?, descripcion = ?, estado = ?
      WHERE id = ?
    `;
    
    const [resultado] = await db.query(sql, [
      nombre, especie, edad, peso, energia, sociabilidad, emoji, rutaImagen, descripcion, estado, idAnimal
    ]);
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }
    
    res.json({ mensaje: 'Ficha del animal actualizada correctamente', imagen: rutaImagen });
    
  } catch (error) {
    console.error('Error al actualizar:', error);
    res.status(500).json({ error: 'Error interno al actualizar en la base de datos' });
  }
});

// RUTA PÚBLICA: Estadísticas para la landing page (no requiere auth)
app.get('/api/stats/publicas', async (req, res) => {
  try {
    const [animales] = await db.query('SELECT COUNT(*) AS total FROM animales');
    const [adoptados] = await db.query("SELECT COUNT(*) AS total FROM animales WHERE estado = 'Adoptado'");
    const [voluntarios] = await db.query("SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'voluntario'");
    const [tareas] = await db.query("SELECT COUNT(*) AS total FROM registro_tareas WHERE estado = 'aprobada'");

    res.json({
      totalAnimales: animales[0].total,
      totalAdoptados: adoptados[0].total,
      totalVoluntarios: voluntarios[0].total,
      tareasCompletadas: tareas[0].total
    });
  } catch (error) {
    console.error('Error stats públicas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// RUTAS DE AUTENTICACIÓN (SEGURIDAD)
// ==========================================

// RUTA PARA REGISTRAR (POST)
app.post('/api/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // 1. VALIDACIÓN DE CONTRASEÑA SEGURA EN EL SERVIDOR
    const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!regexPassword.test(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres, combinando letras y números.' });
    }

    // 2. Comprobar que el email no existe ya
    const [usuariosPrevios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuariosPrevios.length > 0) {
      return res.status(400).json({ error: 'Este email ya está registrado.' });
    }

    // 3. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 4. Guardar en la base de datos
    await db.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, passwordEncriptada]
    );

    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTA PARA INICIAR SESIÓN (POST)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = usuarios[0];

    // 2. Comprobar la contraseña encriptada
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // 3. Generar el Token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token: token,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// RUTAS DE GAMIFICACIÓN (VOLUNTARIOS)
// ==========================================

// 1. CATÁLOGO DE TAREAS (lo que el voluntario puede elegir en el desplegable)
app.get('/api/tareas/catalogo', async (req, res) => {
  try {
    const [tareas] = await db.query('SELECT * FROM catalogo_tareas ORDER BY recompensa_xp ASC');
    res.json(tareas);
  } catch (error) {
    console.error('Error al obtener catálogo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. REGISTRAR UNA TAREA (el voluntario solicita, NO gana XP aún)
app.post('/api/tareas/registrar', verificarToken, async (req, res) => {
  try {
    const { usuario_id, animal_id, tarea_id } = req.body;

    // Validación: los 3 IDs son obligatorios
    if (!usuario_id || !animal_id || !tarea_id) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (usuario_id, animal_id, tarea_id).' });
    }

    // Verificar que la tarea existe en el catálogo (evitar IDs inventados desde el Front)
    const [tareaExiste] = await db.query('SELECT id FROM catalogo_tareas WHERE id = ?', [tarea_id]);
    if (tareaExiste.length === 0) {
      return res.status(404).json({ error: 'La tarea seleccionada no existe en el catálogo.' });
    }

    // Insertar el registro con estado 'pendiente'
    const [resultado] = await db.query(
      'INSERT INTO registro_tareas (usuario_id, animal_id, tarea_id, estado) VALUES (?, ?, ?, ?)',
      [usuario_id, animal_id, tarea_id, 'pendiente']
    );

    res.status(201).json({
      mensaje: 'Tarea registrada. Pendiente de aprobación por un administrador.',
      id_registro: resultado.insertId
    });

  } catch (error) {
    console.error('Error al registrar tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 3. OBTENER TAREAS PENDIENTES (para la bandeja del Admin)
app.get('/api/tareas/pendientes', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [pendientes] = await db.query(`
      SELECT 
        rt.id,
        rt.fecha_creacion,
        u.nombre AS voluntario,
        a.nombre AS animal,
        a.especie,
        ct.nombre AS tarea,
        ct.recompensa_xp
      FROM registro_tareas rt
      JOIN usuarios u ON rt.usuario_id = u.id
      JOIN animales a ON rt.animal_id = a.id
      JOIN catalogo_tareas ct ON rt.tarea_id = ct.id
      WHERE rt.estado = 'pendiente'
      ORDER BY rt.fecha_creacion ASC
    `);

    res.json(pendientes);

  } catch (error) {
    console.error('Error al obtener tareas pendientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 4. REVISAR (APROBAR/RECHAZAR) UNA TAREA (Solo Admin)
app.put('/api/tareas/revisar/:id', verificarToken, verificarAdmin, async (req, res) => {  try {
    const idRegistro = req.params.id;
    const { estado } = req.body;

    // Validar que el estado sea uno de los permitidos
    if (!['aprobada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido. Usa "aprobada" o "rechazada".' });
    }

    // 1. Obtener los datos del registro (con efectos y animal_id)
    const [registros] = await db.query(`
      SELECT 
        rt.usuario_id, 
        rt.animal_id,
        rt.estado AS estado_actual, 
        ct.recompensa_xp,
        ct.efecto_energia,
        ct.efecto_sociabilidad
      FROM registro_tareas rt
      JOIN catalogo_tareas ct ON rt.tarea_id = ct.id
      WHERE rt.id = ?
    `, [idRegistro]);

    if (registros.length === 0) {
      return res.status(404).json({ error: 'Registro de tarea no encontrado.' });
    }

    const registro = registros[0];

    // Seguridad: no permitir re-revisar una tarea ya procesada
    if (registro.estado_actual !== 'pendiente') {
      return res.status(400).json({ error: `Esta tarea ya fue ${registro.estado_actual}. No se puede modificar.` });
    }

    // 2. Actualizar el estado del registro
    await db.query('UPDATE registro_tareas SET estado = ? WHERE id = ?', [estado, idRegistro]);

    // 3. Si se APRUEBA → sumar XP, recalcular nivel Y modificar stats del animal
    if (estado === 'aprobada') {
      const [usuarios] = await db.query('SELECT xp, nivel FROM usuarios WHERE id = ?', [registro.usuario_id]);
      
      const nuevaXp = usuarios[0].xp + registro.recompensa_xp;
      
      // FÓRMULA EXPONENCIAL: Nivel = floor((XP / 100)^(1/1.5)) + 1
      const nuevoNivel = Math.floor(Math.pow(nuevaXp / 100, 1 / 1.5)) + 1;

      await db.query('UPDATE usuarios SET xp = ?, nivel = ? WHERE id = ?', [nuevaXp, nuevoNivel, registro.usuario_id]);

      // --- NUEVO: aplicar efectos al animal con CLAMP [0, 100] ---
      // Se hace en una sola query con GREATEST/LEAST para evitar race conditions
      // y para que la BD garantice que nunca se salen del rango válido.
      let statsAnimal = null;
      if (registro.animal_id && (registro.efecto_energia !== 0 || registro.efecto_sociabilidad !== 0)) {
        await db.query(`
          UPDATE animales 
          SET 
            energia = GREATEST(0, LEAST(100, energia + ?)),
            sociabilidad = GREATEST(0, LEAST(100, sociabilidad + ?))
          WHERE id = ?
        `, [registro.efecto_energia, registro.efecto_sociabilidad, registro.animal_id]);

        // Leer valores finales para devolverlos en la respuesta
        const [animales] = await db.query('SELECT energia, sociabilidad FROM animales WHERE id = ?', [registro.animal_id]);
        if (animales.length > 0) {
          statsAnimal = {
            energia: animales[0].energia,
            sociabilidad: animales[0].sociabilidad
          };
        }
      }

      return res.json({
        mensaje: 'Tarea aprobada. XP asignada al voluntario.',
        xp_otorgada: registro.recompensa_xp,
        nueva_xp_total: nuevaXp,
        nuevo_nivel: nuevoNivel,
        efecto_energia: registro.efecto_energia,
        efecto_sociabilidad: registro.efecto_sociabilidad,
        stats_animal: statsAnimal
      });
    }

    // Si se RECHAZA → simplemente confirmamos
    res.json({ mensaje: 'Tarea rechazada. No se asignó XP.' });

  } catch (error) {
    console.error('Error al revisar tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 5. PERFIL DEL VOLUNTARIO (XP y nivel reales desde la BD)
app.get('/api/usuarios/:id/perfil', async (req, res) => {
  try {
    const [usuarios] = await db.query(
      'SELECT id, nombre, xp, nivel FROM usuarios WHERE id = ?',
      [req.params.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(usuarios[0]);

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 6. HISTORIAL DE TAREAS DEL VOLUNTARIO
app.get('/api/tareas/historial/:usuario_id', verificarToken, async (req, res) => {
  try {
    const idUsuario = req.params.usuario_id;

    // Seguridad: un voluntario solo puede ver SU historial, un admin puede ver el de cualquiera
    if (req.usuario.rol !== 'admin' && req.usuario.id !== Number(idUsuario)) {
      return res.status(403).json({ error: 'No tienes permiso para ver este historial.' });
    }

    const [historial] = await db.query(`
      SELECT 
        rt.id,
        rt.estado,
        rt.fecha_creacion,
        ct.nombre AS tarea,
        ct.recompensa_xp,
        a.nombre AS animal,
        a.emoji
      FROM registro_tareas rt
      JOIN catalogo_tareas ct ON rt.tarea_id = ct.id
      JOIN animales a ON rt.animal_id = a.id
      WHERE rt.usuario_id = ?
      ORDER BY rt.fecha_creacion DESC
      LIMIT 20
    `, [idUsuario]);

    res.json(historial);

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTA PARA OBTENER EL RANKING DE VOLUNTARIOS (GET)
app.get('/api/ranking', async (req, res) => {
  try {
    // Seleccionamos a los voluntarios, los ordenamos por XP de mayor a menor y limitamos a los 5 mejores
    const [ranking] = await db.query(
      'SELECT id, nombre, nivel, xp FROM usuarios WHERE rol = "voluntario" ORDER BY xp DESC LIMIT 5'
    );
    res.json(ranking);
  } catch (error) {
    console.error('Error al obtener el ranking:', error);
    res.status(500).json({ error: 'Error interno del servidor al cargar el ranking' });
  }
});

// ==========================================
// RUTA DE ESTADÍSTICAS (DASHBOARD ADMIN)
// ==========================================
app.get('/api/admin/estadisticas', verificarToken, verificarAdmin, async (req, res) => {  try {
    // 1. Animales por estado
    const [animalesPorEstado] = await db.query(`
      SELECT estado, COUNT(*) AS total 
      FROM animales 
      GROUP BY estado
    `);

    // 2. Total de voluntarios
    const [voluntarios] = await db.query(`
      SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'voluntario'
    `);

    // 3. Tareas por estado (pendientes, aprobadas, rechazadas)
    const [tareasPorEstado] = await db.query(`
      SELECT estado, COUNT(*) AS total 
      FROM registro_tareas 
      GROUP BY estado
    `);

    // 4. Top 5 voluntarios (ranking)
    const [rankingVoluntarios] = await db.query(`
      SELECT nombre, xp, nivel 
      FROM usuarios 
      WHERE rol = 'voluntario' 
      ORDER BY xp DESC 
      LIMIT 5
    `);

    // 5. Tareas más populares (cuáles se piden más)
    const [tareasPopulares] = await db.query(`
      SELECT ct.nombre, COUNT(*) AS total
      FROM registro_tareas rt
      JOIN catalogo_tareas ct ON rt.tarea_id = ct.id
      GROUP BY ct.nombre
      ORDER BY total DESC
    `);

    res.json({
      animalesPorEstado,
      totalVoluntarios: voluntarios[0].total,
      tareasPorEstado,
      rankingVoluntarios,
      tareasPopulares
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// RUTAS DE GALERÍA DE IMÁGENES (MÚLTIPLES FOTOS POR ANIMAL)
// ==========================================

// 1. SUBIR IMÁGENES A UN ANIMAL (hasta 5 a la vez)
app.post('/api/animales/:id/imagenes', verificarToken, verificarAdmin, upload.array('imagenes', 5), async (req, res) => {
  try {
    const animalId = req.params.id;

    // Verificar que el animal existe
    const [animal] = await db.query('SELECT id FROM animales WHERE id = ?', [animalId]);
    if (animal.length === 0) {
      return res.status(404).json({ error: 'Animal no encontrado.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron imágenes.' });
    }

    // Comprobar si el animal ya tiene portada
    const [portadaExiste] = await db.query(
      'SELECT id FROM imagenes_animales WHERE animal_id = ? AND es_portada = 1', [animalId]
    );

    const valores = req.files.map((file, index) => {
      // La primera imagen subida será portada si el animal no tiene ninguna
      const esPortada = (portadaExiste.length === 0 && index === 0) ? 1 : 0;
      return [animalId, obtenerRutaImagen(file), esPortada];
    });

    await db.query(
      'INSERT INTO imagenes_animales (animal_id, ruta, es_portada) VALUES ?',
      [valores]
    );

    // Actualizar también la columna imagen de la tabla animales con la portada
    if (portadaExiste.length === 0 && valores.length > 0) {
      await db.query('UPDATE animales SET imagen = ? WHERE id = ?', [valores[0][1], animalId]);
    }

    res.status(201).json({
      mensaje: `${req.files.length} imagen(es) subida(s) correctamente.`,
      total: req.files.length
    });

  } catch (error) {
    console.error('Error al subir imágenes:', error);
    res.status(500).json({ error: 'Error interno al subir imágenes.' });
  }
});

// 2. OBTENER TODAS LAS IMÁGENES DE UN ANIMAL
app.get('/api/animales/:id/imagenes', async (req, res) => {
  try {
    const [imagenes] = await db.query(
      'SELECT * FROM imagenes_animales WHERE animal_id = ? ORDER BY es_portada DESC, fecha_subida ASC',
      [req.params.id]
    );
    res.json(imagenes);
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// 3. ESTABLECER UNA IMAGEN COMO PORTADA
app.put('/api/imagenes/:id/portada', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const idImagen = req.params.id;

    // Obtener la imagen y su animal
    const [imagen] = await db.query('SELECT * FROM imagenes_animales WHERE id = ?', [idImagen]);
    if (imagen.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada.' });
    }

    const animalId = imagen[0].animal_id;

    // Quitar portada actual de todas las imágenes de ese animal
    await db.query('UPDATE imagenes_animales SET es_portada = 0 WHERE animal_id = ?', [animalId]);

    // Establecer la nueva portada
    await db.query('UPDATE imagenes_animales SET es_portada = 1 WHERE id = ?', [idImagen]);

    // Sincronizar con la columna imagen de la tabla animales
    await db.query('UPDATE animales SET imagen = ? WHERE id = ?', [imagen[0].ruta, animalId]);

    res.json({ mensaje: 'Portada actualizada correctamente.' });

  } catch (error) {
    console.error('Error al cambiar portada:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// 4. BORRAR UNA IMAGEN
app.delete('/api/imagenes/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const idImagen = req.params.id;

    const [imagen] = await db.query('SELECT * FROM imagenes_animales WHERE id = ?', [idImagen]);
    if (imagen.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada.' });
    }

    const eraPortada = imagen[0].es_portada;
    const animalId = imagen[0].animal_id;

    // Borrar de Cloudinary si aplica
    if (useCloudinary) {
      const publicId = obtenerPublicId(imagen[0].ruta);
      if (publicId) {
        try { await cloudinary.uploader.destroy(publicId); } 
        catch (err) { console.warn('No se pudo borrar de Cloudinary:', err.message); }
      }
    }

    // Borrar el registro de la BD
    await db.query('DELETE FROM imagenes_animales WHERE id = ?', [idImagen]);

    // Si era la portada, asignar otra como portada (la más antigua)
    if (eraPortada) {
      const [siguiente] = await db.query(
        'SELECT * FROM imagenes_animales WHERE animal_id = ? ORDER BY fecha_subida ASC LIMIT 1',
        [animalId]
      );

      if (siguiente.length > 0) {
        await db.query('UPDATE imagenes_animales SET es_portada = 1 WHERE id = ?', [siguiente[0].id]);
        await db.query('UPDATE animales SET imagen = ? WHERE id = ?', [siguiente[0].ruta, animalId]);
      } else {
        // No quedan imágenes, limpiamos la columna
        await db.query('UPDATE animales SET imagen = NULL WHERE id = ?', [animalId]);
      }
    }

    res.json({ mensaje: 'Imagen eliminada.' });

  } catch (error) {
    console.error('Error al borrar imagen:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ==========================================
// RUTAS DE ADOPCIÓN (FLUJO CON APROBACIÓN)
// ==========================================

// 1. SOLICITAR ADOPCIÓN (público, no requiere login)
app.post('/api/adopciones/solicitar', async (req, res) => {
  try {
    const { animal_id, nombre_solicitante, email, telefono, mensaje } = req.body;

    // Validación de campos obligatorios
    if (!animal_id || !nombre_solicitante || !email || !telefono) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (animal, nombre, email y teléfono).' });
    }

    // Validar que el animal existe y está disponible
    const [animales] = await db.query('SELECT id, nombre, estado FROM animales WHERE id = ?', [animal_id]);
    if (animales.length === 0) {
      return res.status(404).json({ error: 'Animal no encontrado.' });
    }
    if (animales[0].estado === 'Adoptado') {
      return res.status(400).json({ error: `${animales[0].nombre} ya ha sido adoptado.` });
    }

    // Insertar la solicitud
    const [resultado] = await db.query(
      'INSERT INTO solicitudes_adopcion (animal_id, nombre_solicitante, email, telefono, mensaje) VALUES (?, ?, ?, ?, ?)',
      [animal_id, nombre_solicitante, email, telefono, mensaje || null]
    );

    res.status(201).json({
      mensaje: 'Solicitud de adopción enviada. El refugio se pondrá en contacto contigo.',
      id_solicitud: resultado.insertId
    });

  } catch (error) {
    console.error('Error al solicitar adopción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. OBTENER SOLICITUDES PENDIENTES (para el Admin)
app.get('/api/adopciones/pendientes', verificarToken, verificarAdmin, async (req, res) => {  try {
    const [pendientes] = await db.query(`
      SELECT 
        sa.id,
        sa.nombre_solicitante,
        sa.email,
        sa.telefono,
        sa.mensaje,
        sa.fecha_creacion,
        a.nombre AS animal,
        a.especie,
        a.emoji
      FROM solicitudes_adopcion sa
      JOIN animales a ON sa.animal_id = a.id
      WHERE sa.estado = 'pendiente'
      ORDER BY sa.fecha_creacion ASC
    `);

    res.json(pendientes);

  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 3. REVISAR SOLICITUD DE ADOPCIÓN (Admin aprueba o rechaza)
app.put('/api/adopciones/revisar/:id', verificarToken, verificarAdmin, async (req, res) => {  try {
    const idSolicitud = req.params.id;
    const { estado } = req.body;

    if (!['aprobada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido. Usa "aprobada" o "rechazada".' });
    }

    // Obtener datos de la solicitud
    const [solicitudes] = await db.query(`
      SELECT sa.animal_id, sa.estado AS estado_actual, a.nombre AS animal_nombre
      FROM solicitudes_adopcion sa
      JOIN animales a ON sa.animal_id = a.id
      WHERE sa.id = ?
    `, [idSolicitud]);

    if (solicitudes.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada.' });
    }

    const solicitud = solicitudes[0];

    if (solicitud.estado_actual !== 'pendiente') {
      return res.status(400).json({ error: `Esta solicitud ya fue ${solicitud.estado_actual}.` });
    }

    // Actualizar estado de la solicitud
    await db.query('UPDATE solicitudes_adopcion SET estado = ? WHERE id = ?', [estado, idSolicitud]);

    // Si se APRUEBA → cambiar el estado del animal a "Adoptado"
    if (estado === 'aprobada') {
      await db.query('UPDATE animales SET estado = ? WHERE id = ?', ['Adoptado', solicitud.animal_id]);

      return res.json({
        mensaje: `Adopción aprobada. ${solicitud.animal_nombre} ahora figura como Adoptado.`
      });
    }

    res.json({ mensaje: 'Solicitud rechazada.' });

  } catch (error) {
    console.error('Error al revisar solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// RUTAS DE GENERACIÓN DE INFORMES PDF
// ==========================================

// INFORME: Listado de animales (filtrable por estado)
app.get('/api/informes/animales', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { estado } = req.query; // Opcional: ?estado=Refugio

    let sql = 'SELECT * FROM animales';
    let params = [];

    if (estado && estado !== 'Todos') {
      sql += ' WHERE estado = ?';
      params.push(estado);
    }

    sql += ' ORDER BY nombre ASC';
    const [animales] = await db.query(sql, params);

    // Crear el documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Configurar la respuesta HTTP como PDF descargable
    const nombreArchivo = estado && estado !== 'Todos'
      ? `informe_animales_${estado.toLowerCase()}.pdf`
      : 'informe_animales_completo.pdf';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    doc.pipe(res);

    // --- CABECERA DEL INFORME ---
    doc.fontSize(22).font('Helvetica-Bold').text('ShelterDex', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(14).font('Helvetica').text('Informe de Animales del Refugio', { align: 'center' });
    doc.moveDown(0.3);

    // Filtro aplicado y fecha
    const filtroTexto = estado && estado !== 'Todos' ? `Estado: ${estado}` : 'Todos los estados';
    const fechaActual = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.fontSize(10).fillColor('#666666').text(`Filtro: ${filtroTexto}  |  Generado: ${fechaActual}  |  Total: ${animales.length} registros`, { align: 'center' });
    
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#222224').lineWidth(2).stroke();
    doc.moveDown(1);

    // --- TABLA DE DATOS ---
    if (animales.length === 0) {
      doc.fontSize(12).fillColor('#999999').text('No se encontraron animales con los filtros seleccionados.', { align: 'center' });
    } else {
      // Cabecera de la tabla
      const inicioTabla = doc.y;
      doc.rect(50, inicioTabla, 495, 25).fill('#222224');
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
      doc.text('ID', 55, inicioTabla + 7, { width: 30 });
      doc.text('NOMBRE', 90, inicioTabla + 7, { width: 100 });
      doc.text('ESPECIE', 195, inicioTabla + 7, { width: 70 });
      doc.text('EDAD', 270, inicioTabla + 7, { width: 70 });
      doc.text('PESO', 345, inicioTabla + 7, { width: 60 });
      doc.text('ESTADO', 410, inicioTabla + 7, { width: 70 });
      doc.text('ENERGÍA', 485, inicioTabla + 7, { width: 55 });

      let filaY = inicioTabla + 25;

      animales.forEach((animal, index) => {
        // Si nos quedamos sin espacio, nueva página
        if (filaY > 750) {
          doc.addPage();
          filaY = 50;
        }

        // Fondo alterno para legibilidad
        if (index % 2 === 0) {
          doc.rect(50, filaY, 495, 22).fill('#F3F4F6');
        }

        doc.fontSize(9).font('Helvetica').fillColor('#333333');
        doc.text(`${animal.id}`, 55, filaY + 6, { width: 30 });
        doc.text(animal.nombre, 90, filaY + 6, { width: 100 });
        doc.text(animal.especie, 195, filaY + 6, { width: 70 });
        doc.text(animal.edad || '-', 270, filaY + 6, { width: 70 });
        doc.text(animal.peso || '-', 345, filaY + 6, { width: 60 });
        doc.text(animal.estado, 410, filaY + 6, { width: 70 });
        doc.text(`${animal.energia}/100`, 485, filaY + 6, { width: 55 });

        filaY += 22;
      });

      // Línea de cierre de tabla
      doc.moveTo(50, filaY).lineTo(545, filaY).strokeColor('#222224').lineWidth(1).stroke();
    }

    // --- PIE DE PÁGINA ---
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#999999').text('Documento generado automáticamente por ShelterDex. Uso interno del refugio.', 50, 780, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Error al generar informe de animales:', error);
    res.status(500).json({ error: 'Error interno al generar el informe.' });
  }
});

// INFORME: Actividad de voluntarios (ranking + tareas completadas)
app.get('/api/informes/voluntarios', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // Datos de voluntarios
    const [voluntarios] = await db.query(
      'SELECT nombre, email, xp, nivel FROM usuarios WHERE rol = "voluntario" ORDER BY xp DESC'
    );

    // Resumen de tareas
    const [resumenTareas] = await db.query(`
      SELECT 
        u.nombre AS voluntario,
        COUNT(*) AS total_tareas,
        SUM(CASE WHEN rt.estado = 'aprobada' THEN 1 ELSE 0 END) AS aprobadas,
        SUM(CASE WHEN rt.estado = 'rechazada' THEN 1 ELSE 0 END) AS rechazadas,
        SUM(CASE WHEN rt.estado = 'pendiente' THEN 1 ELSE 0 END) AS pendientes
      FROM registro_tareas rt
      JOIN usuarios u ON rt.usuario_id = u.id
      GROUP BY u.nombre
      ORDER BY total_tareas DESC
    `);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="informe_voluntarios.pdf"');
    doc.pipe(res);

    // --- CABECERA ---
    doc.fontSize(22).font('Helvetica-Bold').text('ShelterDex', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(14).font('Helvetica').text('Informe de Actividad de Voluntarios', { align: 'center' });
    doc.moveDown(0.3);
    const fechaActual = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.fontSize(10).fillColor('#666666').text(`Generado: ${fechaActual}  |  Total voluntarios: ${voluntarios.length}`, { align: 'center' });
    
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#222224').lineWidth(2).stroke();
    doc.moveDown(1);

    // --- SECCIÓN 1: RANKING ---
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#222224').text('Ranking de Voluntarios');
    doc.moveDown(0.5);

    if (voluntarios.length === 0) {
      doc.fontSize(11).fillColor('#999999').text('No hay voluntarios registrados.');
    } else {
      const inicioTabla = doc.y;
      doc.rect(50, inicioTabla, 495, 25).fill('#222224');
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
      doc.text('#', 55, inicioTabla + 7, { width: 25 });
      doc.text('NOMBRE', 85, inicioTabla + 7, { width: 150 });
      doc.text('EMAIL', 240, inicioTabla + 7, { width: 160 });
      doc.text('NIVEL', 405, inicioTabla + 7, { width: 50 });
      doc.text('XP', 460, inicioTabla + 7, { width: 80 });

      let filaY = inicioTabla + 25;

      voluntarios.forEach((vol, index) => {
        if (filaY > 700) { doc.addPage(); filaY = 50; }

        if (index % 2 === 0) doc.rect(50, filaY, 495, 22).fill('#F3F4F6');

        doc.fontSize(9).font('Helvetica').fillColor('#333333');
        doc.text(`${index + 1}`, 55, filaY + 6, { width: 25 });
        doc.text(vol.nombre, 85, filaY + 6, { width: 150 });
        doc.text(vol.email, 240, filaY + 6, { width: 160 });
        doc.text(`${vol.nivel}`, 405, filaY + 6, { width: 50 });
        doc.text(`${vol.xp} XP`, 460, filaY + 6, { width: 80 });
        filaY += 22;
      });

      doc.moveTo(50, filaY).lineTo(545, filaY).strokeColor('#222224').lineWidth(1).stroke();
    }

    // --- SECCIÓN 2: RESUMEN DE TAREAS ---
    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#222224').text('Resumen de Tareas por Voluntario');
    doc.moveDown(0.5);

    if (resumenTareas.length === 0) {
      doc.fontSize(11).fillColor('#999999').text('No hay tareas registradas.');
    } else {
      const inicioTabla2 = doc.y;
      doc.rect(50, inicioTabla2, 495, 25).fill('#222224');
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
      doc.text('VOLUNTARIO', 55, inicioTabla2 + 7, { width: 150 });
      doc.text('TOTAL', 210, inicioTabla2 + 7, { width: 70 });
      doc.text('APROBADAS', 285, inicioTabla2 + 7, { width: 70 });
      doc.text('RECHAZADAS', 360, inicioTabla2 + 7, { width: 70 });
      doc.text('PENDIENTES', 435, inicioTabla2 + 7, { width: 70 });

      let filaY2 = inicioTabla2 + 25;

      resumenTareas.forEach((tarea, index) => {
        if (filaY2 > 750) { doc.addPage(); filaY2 = 50; }
        if (index % 2 === 0) doc.rect(50, filaY2, 495, 22).fill('#F3F4F6');

        doc.fontSize(9).font('Helvetica').fillColor('#333333');
        doc.text(tarea.voluntario, 55, filaY2 + 6, { width: 150 });
        doc.text(`${tarea.total_tareas}`, 210, filaY2 + 6, { width: 70 });
        doc.text(`${tarea.aprobadas}`, 285, filaY2 + 6, { width: 70 });
        doc.text(`${tarea.rechazadas}`, 360, filaY2 + 6, { width: 70 });
        doc.text(`${tarea.pendientes}`, 435, filaY2 + 6, { width: 70 });
        filaY2 += 22;
      });

      doc.moveTo(50, filaY2).lineTo(545, filaY2).strokeColor('#222224').lineWidth(1).stroke();
    }

    // --- PIE ---
    doc.fontSize(8).fillColor('#999999').text('Documento generado automáticamente por ShelterDex. Uso interno del refugio.', 50, 780, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Error al generar informe de voluntarios:', error);
    res.status(500).json({ error: 'Error interno al generar el informe.' });
  }
});

// ==========================================
// ENDPOINTS PAYPAL (pasarela de donaciones)
// ==========================================
// Arquitectura server-side: la orden se CREA y se CAPTURA desde el backend
// para que el importe no sea manipulable desde el cliente. El frontend solo
// recibe un orderID que pasa al SDK de PayPal.

// Helper: valida que PayPal esté configurado antes de procesar
const verificarPayPalDisponible = (req, res, next) => {
  if (!paypalOrdersController) {
    return res.status(503).json({ 
      error: 'La pasarela de PayPal no está configurada en el servidor.' 
    });
  }
  next();
};

// 1. CREAR ORDEN: el frontend pide al backend que cree una orden con un importe
app.post('/api/paypal/crear-orden', verificarPayPalDisponible, async (req, res) => {
  try {
    const { cantidad } = req.body;

    // Validación estricta del importe (nunca confiar en el cliente)
    const importe = Number(cantidad);
    if (!Number.isFinite(importe) || importe < 1 || importe > 10000) {
      return res.status(400).json({ 
        error: 'Importe inválido. Debe estar entre 1€ y 10.000€.' 
      });
    }

    const importeFormateado = importe.toFixed(2); // PayPal exige 2 decimales como string

    const { result } = await paypalOrdersController.createOrder({
      body: {
        intent: 'CAPTURE',
        purchaseUnits: [{
          amount: {
            currencyCode: 'EUR',
            value: importeFormateado,
          },
          description: 'Donación al refugio ShelterDex',
        }],
      },
      prefer: 'return=representation',
    });

    return res.status(201).json({
      orderID: result.id,
      status: result.status,
    });
  } catch (error) {
    console.error('Error al crear orden PayPal:', error?.message || error);
    return res.status(500).json({ error: 'No se pudo crear la orden de pago.' });
  }
});

// 2. CAPTURAR ORDEN: el frontend llama aquí cuando el usuario aprueba el pago
app.post('/api/paypal/capturar-orden/:orderID', verificarPayPalDisponible, async (req, res) => {
  try {
    const { orderID } = req.params;

    if (!orderID || typeof orderID !== 'string') {
      return res.status(400).json({ error: 'orderID inválido.' });
    }

    const { result } = await paypalOrdersController.captureOrder({
      id: orderID,
      prefer: 'return=representation',
    });

    // Solo consideramos éxito si el estado final es COMPLETED
    if (result.status !== 'COMPLETED') {
      return res.status(402).json({ 
        error: `El pago no se completó (estado: ${result.status}).`,
        status: result.status
      });
    }

    // Extraer datos útiles de la captura para devolver al frontend
    const captura = result.purchaseUnits?.[0]?.payments?.captures?.[0];

    return res.json({
      mensaje: 'Donación procesada correctamente.',
      orderID: result.id,
      captureID: captura?.id,
      importe: captura?.amount?.value,
      moneda: captura?.amount?.currencyCode,
      nombre_donante: result.payer?.name?.givenName || null,
      email_donante: result.payer?.emailAddress || null,
    });
  } catch (error) {
    console.error('Error al capturar orden PayPal:', error?.message || error);
    return res.status(500).json({ error: 'No se pudo capturar el pago.' });
  }
});

// ==========================================
// ARRANQUE DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API ShelterDex corriendo en http://localhost:${PORT}`);
});