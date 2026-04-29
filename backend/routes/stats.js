import { Router } from 'express';
import db from '../db.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';

const router = Router();

// Estadísticas públicas para la landing page (no requiere auth)
router.get('/stats/publicas', async (req, res) => {
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

// Perfil del voluntario (XP y nivel reales desde la BD)
router.get('/usuarios/:id/perfil', async (req, res) => {
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

// Ranking de voluntarios
router.get('/ranking', async (req, res) => {
  try {
    const [ranking] = await db.query(
      "SELECT id, nombre, nivel, xp FROM usuarios WHERE rol = 'voluntario' ORDER BY xp DESC LIMIT 5"
    );
    res.json(ranking);
  } catch (error) {
    console.error('Error al obtener el ranking:', error);
    res.status(500).json({ error: 'Error interno del servidor al cargar el ranking' });
  }
});

// Estadísticas del dashboard admin
router.get('/admin/estadisticas', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [animalesPorEstado] = await db.query(`
      SELECT estado, COUNT(*) AS total 
      FROM animales 
      GROUP BY estado
    `);

    const [voluntarios] = await db.query(`
      SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'voluntario'
    `);

    const [tareasPorEstado] = await db.query(`
      SELECT estado, COUNT(*) AS total 
      FROM registro_tareas 
      GROUP BY estado
    `);

    const [rankingVoluntarios] = await db.query(`
      SELECT nombre, xp, nivel 
      FROM usuarios 
      WHERE rol = 'voluntario' 
      ORDER BY xp DESC 
      LIMIT 5
    `);

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

export default router;