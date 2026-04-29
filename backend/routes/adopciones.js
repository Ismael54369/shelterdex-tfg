import { Router } from 'express';
import db from '../db.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';

const router = Router();

// 1. SOLICITAR ADOPCIÓN (público, no requiere login)
router.post('/solicitar', async (req, res) => {
  try {
    const { animal_id, nombre_solicitante, email, telefono, mensaje } = req.body;

    if (!animal_id || !nombre_solicitante || !email || !telefono) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (animal, nombre, email y teléfono).' });
    }

    const [animales] = await db.query('SELECT id, nombre, estado FROM animales WHERE id = ?', [animal_id]);
    if (animales.length === 0) {
      return res.status(404).json({ error: 'Animal no encontrado.' });
    }
    if (animales[0].estado === 'Adoptado') {
      return res.status(400).json({ error: `${animales[0].nombre} ya ha sido adoptado.` });
    }

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
router.get('/pendientes', verificarToken, verificarAdmin, async (req, res) => {
  try {
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
router.put('/revisar/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const idSolicitud = req.params.id;
    const { estado } = req.body;

    if (!['aprobada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido. Usa "aprobada" o "rechazada".' });
    }

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

    await db.query('UPDATE solicitudes_adopcion SET estado = ? WHERE id = ?', [estado, idSolicitud]);

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

export default router;