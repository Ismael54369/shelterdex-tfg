import { Router } from 'express';
import db from '../db.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';

const router = Router();

// 1. CATÁLOGO DE TAREAS (lo que el voluntario puede elegir en el desplegable)
router.get('/catalogo', async (req, res) => {
  try {
    const [tareas] = await db.query('SELECT * FROM catalogo_tareas ORDER BY recompensa_xp ASC');
    res.json(tareas);
  } catch (error) {
    console.error('Error al obtener catálogo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. REGISTRAR UNA TAREA (el voluntario solicita, NO gana XP aún)
router.post('/registrar', verificarToken, async (req, res) => {
  try {
    const { usuario_id, animal_id, tarea_id } = req.body;

    if (!usuario_id || !animal_id || !tarea_id) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (usuario_id, animal_id, tarea_id).' });
    }

    const [tareaExiste] = await db.query('SELECT id FROM catalogo_tareas WHERE id = ?', [tarea_id]);
    if (tareaExiste.length === 0) {
      return res.status(404).json({ error: 'La tarea seleccionada no existe en el catálogo.' });
    }

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
router.get('/pendientes', verificarToken, verificarAdmin, async (req, res) => {
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
router.put('/revisar/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const idRegistro = req.params.id;
    const { estado } = req.body;

    if (!['aprobada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido. Usa "aprobada" o "rechazada".' });
    }

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

    if (registro.estado_actual !== 'pendiente') {
      return res.status(400).json({ error: `Esta tarea ya fue ${registro.estado_actual}. No se puede modificar.` });
    }

    await db.query('UPDATE registro_tareas SET estado = ? WHERE id = ?', [estado, idRegistro]);

    if (estado === 'aprobada') {
      const [usuarios] = await db.query('SELECT xp, nivel FROM usuarios WHERE id = ?', [registro.usuario_id]);
      
      const nuevaXp = usuarios[0].xp + registro.recompensa_xp;
      
      // FÓRMULA EXPONENCIAL: Nivel = floor((XP / 100)^(1/1.5)) + 1
      const nuevoNivel = Math.floor(Math.pow(nuevaXp / 100, 1 / 1.5)) + 1;

      await db.query('UPDATE usuarios SET xp = ?, nivel = ? WHERE id = ?', [nuevaXp, nuevoNivel, registro.usuario_id]);

      // Aplicar efectos al animal con CLAMP [0, 100]
      let statsAnimal = null;
      if (registro.animal_id && (registro.efecto_energia !== 0 || registro.efecto_sociabilidad !== 0)) {
        await db.query(`
          UPDATE animales 
          SET 
            energia = GREATEST(0, LEAST(100, energia + ?)),
            sociabilidad = GREATEST(0, LEAST(100, sociabilidad + ?))
          WHERE id = ?
        `, [registro.efecto_energia, registro.efecto_sociabilidad, registro.animal_id]);

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

    res.json({ mensaje: 'Tarea rechazada. No se asignó XP.' });

  } catch (error) {
    console.error('Error al revisar tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 5. HISTORIAL DE TAREAS DEL VOLUNTARIO
router.get('/historial/:usuario_id', verificarToken, async (req, res) => {
  try {
    const idUsuario = req.params.usuario_id;

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

export default router;