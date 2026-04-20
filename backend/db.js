import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargamos las variables del archivo .env
dotenv.config();

// __dirname no existe en ES modules, lo recreamos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración SSL para proveedores remotos (Aiven, Railway, etc.)
// Si DB_SSL=true en .env y existe el archivo ca.pem, lo usa.
// En desarrollo local (XAMPP) no se necesita SSL.
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

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shelterdex_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...sslConfig,
});

// Comprobamos la conexión
db.getConnection()
  .then(conn => {
    console.log('Base de Datos MySQL conectada con éxito');
    conn.release();
  })
  .catch(err => {
    console.error('Error fatal de base de datos:', err.message);
  });

export default db;