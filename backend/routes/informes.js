import { Router } from 'express';
import PDFDocument from 'pdfkit';
import db from '../db.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';

const router = Router();

// INFORME: Listado de animales (filtrable por estado)
router.get('/animales', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { estado } = req.query;

    let sql = 'SELECT * FROM animales';
    let params = [];

    if (estado && estado !== 'Todos') {
      sql += ' WHERE estado = ?';
      params.push(estado);
    }

    sql += ' ORDER BY nombre ASC';
    const [animales] = await db.query(sql, params);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

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
        if (filaY > 750) {
          doc.addPage();
          filaY = 50;
        }

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
router.get('/voluntarios', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [voluntarios] = await db.query(
      "SELECT nombre, email, xp, nivel FROM usuarios WHERE rol = 'voluntario' ORDER BY xp DESC"
    );

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

export default router;