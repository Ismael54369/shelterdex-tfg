import express from 'express';
import cors from 'cors';
import db from './db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json());

// Servir la carpeta de imágenes como ruta pública
// Esto permite acceder a las fotos con: http://localhost:3000/uploads/nombre-archivo.jpg
app.use('/uploads', express.static('uploads'));

// Configuración de Multer (dónde y cómo se guardan las imágenes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generamos un nombre único: timestamp + extensión original
    // Ejemplo: 1712750400000.jpg
    const nombreUnico = Date.now() + path.extname(file.originalname);
    cb(null, nombreUnico);
  }
});

// Filtro de seguridad: solo aceptamos imágenes reales
const filtroImagenes = (req, file, cb) => {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WebP.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter: filtroImagenes,
  limits: { fileSize: 5 * 1024 * 1024 } // Máximo 5MB
});

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

// RUTA 1b: Obtener UN animal por ID (READ - GET)
app.get('/api/animales/:id', async (req, res) => {
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

// RUTA 3: Añadir un nuevo animal (CREATE - POST) — Ahora con imagen opcional
app.post('/api/animales', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, especie, edad, peso, energia, sociabilidad, emoji, descripcion } = req.body;
    
    // Si se subió una imagen, guardamos la ruta relativa; si no, queda NULL
    const rutaImagen = req.file ? `/uploads/${req.file.filename}` : null;
    
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

// RUTA 4: Actualizar un animal existente (UPDATE - PUT) — Ahora con imagen opcional
app.put('/api/animales/:id', upload.single('imagen'), async (req, res) => {
  try {
    const idAnimal = req.params.id;
    const { nombre, especie, edad, peso, energia, sociabilidad, emoji, descripcion, estado } = req.body;
    
    // Si se sube nueva imagen, usamos la nueva ruta; si no, mantenemos la que ya tenía
    let rutaImagen = req.body.imagenExistente || null;
    if (req.file) {
      rutaImagen = `/uploads/${req.file.filename}`;
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
// RUTAS DE AUTENTICACIÓN (SEGURIDAD)
// ==========================================

// RUTA PARA REGISTRAR (POST)
app.post('/api/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // 1. VALIDACIÓN DE CONTRASEÑA SEGURA EN EL SERVIDOR
    const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!regexPassword.test(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres, combinando letras y números.' });
    }

    // 2. Comprobar que el email no existe ya
    const [usuariosPrevios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuariosPrevios.length > 0) {
      return res.status(400).json({ error: 'Este email ya está registrado.' });
    }

    // 3. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 4. Guardar en la base de datos
    await db.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, passwordEncriptada]
    );

    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTA PARA INICIAR SESIÓN (POST)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = usuarios[0];

    // 2. Comprobar la contraseña encriptada
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // 3. Generar el Token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token: token,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// RUTAS DE GAMIFICACIÓN (VOLUNTARIOS)
// ==========================================

// 1. CATÁLOGO DE TAREAS (lo que el voluntario puede elegir en el desplegable)
app.get('/api/tareas/catalogo', async (req, res) => {
  try {
    const [tareas] = await db.query('SELECT * FROM catalogo_tareas ORDER BY recompensa_xp ASC');
    res.json(tareas);
  } catch (error) {
    console.error('Error al obtener catálogo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. REGISTRAR UNA TAREA (el voluntario solicita, NO gana XP aún)
app.post('/api/tareas/registrar', async (req, res) => {
  try {
    const { usuario_id, animal_id, tarea_id } = req.body;

    // Validación: los 3 IDs son obligatorios
    if (!usuario_id || !animal_id || !tarea_id) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (usuario_id, animal_id, tarea_id).' });
    }

    // Verificar que la tarea existe en el catálogo (evitar IDs inventados desde el Front)
    const [tareaExiste] = await db.query('SELECT id FROM catalogo_tareas WHERE id = ?', [tarea_id]);
    if (tareaExiste.length === 0) {
      return res.status(404).json({ error: 'La tarea seleccionada no existe en el catálogo.' });
    }

    // Insertar el registro con estado 'pendiente'
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
app.get('/api/tareas/pendientes', async (req, res) => {
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
app.put('/api/tareas/revisar/:id', async (req, res) => {
  try {
    const idRegistro = req.params.id;
    const { estado } = req.body;

    // Validar que el estado sea uno de los permitidos
    if (!['aprobada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido. Usa "aprobada" o "rechazada".' });
    }

    // 1. Obtener los datos del registro
    const [registros] = await db.query(`
      SELECT rt.usuario_id, rt.estado AS estado_actual, ct.recompensa_xp
      FROM registro_tareas rt
      JOIN catalogo_tareas ct ON rt.tarea_id = ct.id
      WHERE rt.id = ?
    `, [idRegistro]);

    if (registros.length === 0) {
      return res.status(404).json({ error: 'Registro de tarea no encontrado.' });
    }

    const registro = registros[0];

    // Seguridad: no permitir re-revisar una tarea ya procesada
    if (registro.estado_actual !== 'pendiente') {
      return res.status(400).json({ error: `Esta tarea ya fue ${registro.estado_actual}. No se puede modificar.` });
    }

    // 2. Actualizar el estado del registro
    await db.query('UPDATE registro_tareas SET estado = ? WHERE id = ?', [estado, idRegistro]);

    // 3. Si se APRUEBA → sumar XP y recalcular nivel
    if (estado === 'aprobada') {
      const [usuarios] = await db.query('SELECT xp, nivel FROM usuarios WHERE id = ?', [registro.usuario_id]);
      
      const nuevaXp = usuarios[0].xp + registro.recompensa_xp;
      
      // FÓRMULA EXPONENCIAL: Nivel = floor((XP / 100)^(1/1.5)) + 1
      const nuevoNivel = Math.floor(Math.pow(nuevaXp / 100, 1 / 1.5)) + 1;

      await db.query('UPDATE usuarios SET xp = ?, nivel = ? WHERE id = ?', [nuevaXp, nuevoNivel, registro.usuario_id]);

      return res.json({
        mensaje: 'Tarea aprobada. XP asignada al voluntario.',
        xp_otorgada: registro.recompensa_xp,
        nueva_xp_total: nuevaXp,
        nuevo_nivel: nuevoNivel
      });
    }

    // Si se RECHAZA → simplemente confirmamos
    res.json({ mensaje: 'Tarea rechazada. No se asignó XP.' });

  } catch (error) {
    console.error('Error al revisar tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 5. PERFIL DEL VOLUNTARIO (XP y nivel reales desde la BD)
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
      'SELECT id, nombre, nivel, xp FROM usuarios WHERE rol = "voluntario" ORDER BY xp DESC LIMIT 5'
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
app.get('/api/admin/estadisticas', async (req, res) => {
  try {
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
// RUTAS DE ADOPCIÓN (FLUJO CON APROBACIÓN)
// ==========================================

// 1. SOLICITAR ADOPCIÓN (público, no requiere login)
app.post('/api/adopciones/solicitar', async (req, res) => {
  try {
    const { animal_id, nombre_solicitante, email, telefono, mensaje } = req.body;

    // Validación de campos obligatorios
    if (!animal_id || !nombre_solicitante || !email || !telefono) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (animal, nombre, email y teléfono).' });
    }

    // Validar que el animal existe y está disponible
    const [animales] = await db.query('SELECT id, nombre, estado FROM animales WHERE id = ?', [animal_id]);
    if (animales.length === 0) {
      return res.status(404).json({ error: 'Animal no encontrado.' });
    }
    if (animales[0].estado === 'Adoptado') {
      return res.status(400).json({ error: `${animales[0].nombre} ya ha sido adoptado.` });
    }

    // Insertar la solicitud
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
app.get('/api/adopciones/pendientes', async (req, res) => {
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
app.put('/api/adopciones/revisar/:id', async (req, res) => {
  try {
    const idSolicitud = req.params.id;
    const { estado } = req.body;

    if (!['aprobada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido. Usa "aprobada" o "rechazada".' });
    }

    // Obtener datos de la solicitud
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

    // Actualizar estado de la solicitud
    await db.query('UPDATE solicitudes_adopcion SET estado = ? WHERE id = ?', [estado, idSolicitud]);

    // Si se APRUEBA → cambiar el estado del animal a "Adoptado"
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

// ==========================================
// ARRANQUE DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API ShelterDex corriendo en http://localhost:${PORT}`);
});