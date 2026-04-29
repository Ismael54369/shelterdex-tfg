import express from 'express';
import cors from 'cors';
import db from './db.js'; 
import { upload, obtenerRutaImagen, obtenerPublicId, useCloudinary, cloudinary } from './config/multer.js';
import { verificarToken, verificarAdmin } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import animalesRoutes from './routes/animales.js';
import tareasRoutes from './routes/tareas.js';
import adopcionesRoutes from './routes/adopciones.js';
import informesRoutes from './routes/informes.js';
import paypalRoutes from './routes/paypal.js';
import statsRoutes from './routes/stats.js';

const app = express();

// Middlewares
const corsOptions = process.env.FRONTEND_URL
  ? { origin: process.env.FRONTEND_URL, credentials: true }
  : { origin: '*' };
app.use(cors(corsOptions));
app.use(express.json());
// Servir la carpeta de imágenes como ruta pública (solo útil en desarrollo local)
app.use('/uploads', express.static('uploads'));
// Rutas de autenticación
app.use('/api', authRoutes);
// Rutas de animales + galería
app.use('/api/animales', animalesRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/adopciones', adopcionesRoutes);
app.use('/api/informes', informesRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api', statsRoutes);

// ==========================================
// RUTAS DE GALERÍA DE IMÁGENES (MÚLTIPLES FOTOS POR ANIMAL)
// ==========================================

// ESTABLECER UNA IMAGEN COMO PORTADA
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

// BORRAR UNA IMAGEN
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
// ARRANQUE DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API ShelterDex corriendo en http://localhost:${PORT}`);
});