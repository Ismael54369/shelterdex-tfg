import express from 'express';
import cors from 'cors';
import db from './db.js'; 
import PDFDocument from 'pdfkit';
import { paypalOrdersController, verificarPayPalDisponible } from './config/paypal.js';
import { upload, obtenerRutaImagen, obtenerPublicId, useCloudinary, cloudinary } from './config/multer.js';
import { verificarToken, verificarAdmin } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import animalesRoutes from './routes/animales.js';
import tareasRoutes from './routes/tareas.js';
import adopcionesRoutes from './routes/adopciones.js';

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

// ==========================================
// RUTAS DE LA API (Endpoints)
// ==========================================

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
// RUTAS DE GAMIFICACIÓN (VOLUNTARIOS)
// ==========================================

// PERFIL DEL VOLUNTARIO (XP y nivel reales desde la BD)
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

// RUTA PARA OBTENER EL RANKING DE VOLUNTARIOS (GET)
app.get('/api/ranking', async (req, res) => {
  try {
    // Seleccionamos a los voluntarios, los ordenamos por XP de mayor a menor y limitamos a los 5 mejores
    const [ranking] = await db.query(
      "SELECT id, nombre, nivel, xp FROM usuarios WHERE rol = 'voluntario' ORDER BY xp DESC LIMIT 5"
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
      "SELECT nombre, email, xp, nivel FROM usuarios WHERE rol = 'voluntario' ORDER BY xp DESC"
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