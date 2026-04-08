import express from 'express';
import cors from 'cors';
import db from './db.js'; // Importamos la conexión a la BD

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json());

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

// RUTA 2: Borrar un animal (DELETE)
app.delete('/api/animales/:id', async (req, res) => {
  try {
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

// ==========================================
// ARRANQUE DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API ShelterDex corriendo en http://localhost:${PORT}`);
});