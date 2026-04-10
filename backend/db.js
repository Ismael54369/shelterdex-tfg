import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargamos las variables del archivo .env
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shelterdex_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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