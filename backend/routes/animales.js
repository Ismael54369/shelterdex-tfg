import { Router } from 'express';
import db from '../db.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';
import { upload, obtenerRutaImagen } from '../config/multer.js';

const router = Router();

// Obtener todos los animales (READ - GET)
router.get('/', async (req, res) => {
  try {
    const [filas] = await db.query('SELECT * FROM animales');
    res.json(filas);
  } catch (error) {
    console.error('Error al obtener animales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener UN animal por ID (READ - GET)
router.get('/:id', async (req, res) => {
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

// Borrar un animal (DELETE)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const idAnimal = req.params.id;
    
    const [resultado] = await db.query('DELETE FROM animales WHERE id = ?', [idAnimal]);
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }
    
    res.json({ mensaje: 'Animal borrado correctamente de la Base de Datos' });
    
  } catch (error) {
    console.error('Error al borrar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Añadir un nuevo animal (CREATE - POST)
router.post('/', verificarToken, verificarAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, especie, edad, peso, energia, sociabilidad, emoji, descripcion } = req.body;
    
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

// Actualizar un animal existente (UPDATE - PUT)
router.put('/:id', verificarToken, verificarAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const idAnimal = req.params.id;
    const { nombre, especie, edad, peso, energia, sociabilidad, emoji, descripcion, estado } = req.body;
    
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

// ==========================================
// GALERÍA DE IMÁGENES
// ==========================================

// Subir imágenes a un animal (hasta 5 a la vez)
router.post('/:id/imagenes', verificarToken, verificarAdmin, upload.array('imagenes', 5), async (req, res) => {
  try {
    const animalId = req.params.id;

    const [animal] = await db.query('SELECT id FROM animales WHERE id = ?', [animalId]);
    if (animal.length === 0) {
      return res.status(404).json({ error: 'Animal no encontrado.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron imágenes.' });
    }

    const [portadaExiste] = await db.query(
      'SELECT id FROM imagenes_animales WHERE animal_id = ? AND es_portada = 1', [animalId]
    );

    const valores = req.files.map((file, index) => {
      const esPortada = (portadaExiste.length === 0 && index === 0) ? 1 : 0;
      return [animalId, obtenerRutaImagen(file), esPortada];
    });

    await db.query(
      'INSERT INTO imagenes_animales (animal_id, ruta, es_portada) VALUES ?',
      [valores]
    );

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

// Obtener todas las imágenes de un animal
router.get('/:id/imagenes', async (req, res) => {
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

export default router;