import express from 'express';
import cors from 'cors';
import db from './db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

// RUTA 3: Añadir un nuevo animal (CREATE - POST)
app.post('/api/animales', async (req, res) => {
  try {
    // req.body contiene los datos que nos envía el formulario de React
    const { nombre, especie, edad, peso, energia, sociabilidad, emoji, descripcion } = req.body;
    
    // Consulta SQL para insertar los datos
    const sql = `
      INSERT INTO animales 
      (nombre, especie, edad, peso, energia, sociabilidad, emoji, descripcion, estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Refugio')
    `;
    
    // Ejecutamos la consulta pasándole los valores (los ? evitan ataques de inyección SQL)
    const [resultado] = await db.query(sql, [
      nombre, 
      especie, 
      edad, 
      peso, 
      energia || 50, // Si no envían energía, ponemos 50 por defecto
      sociabilidad || 50, 
      emoji || '🐾', 
      descripcion
    ]);
    
    // Respondemos con éxito y devolvemos el ID que MySQL le ha asignado
    res.status(201).json({ 
      mensaje: 'Animal añadido con éxito', 
      id: resultado.insertId 
    });
    
  } catch (error) {
    console.error('Error al insertar:', error);
    res.status(500).json({ error: 'Error interno al guardar en la base de datos' });
  }
});

// RUTA 4: Actualizar un animal existente (UPDATE - PUT)
app.put('/api/animales/:id', async (req, res) => {
  try {
    const idAnimal = req.params.id;
    // Extraemos todos los campos que nos envía el formulario
    const { nombre, especie, edad, peso, energia, sociabilidad, emoji, descripcion, estado } = req.body;
    
    // Consulta SQL para actualizar (UPDATE)
    const sql = `
      UPDATE animales 
      SET nombre = ?, especie = ?, edad = ?, peso = ?, energia = ?, sociabilidad = ?, emoji = ?, descripcion = ?, estado = ?
      WHERE id = ?
    `;
    
    // Ejecutamos pasando los valores en el mismo orden que los interrogantes (?)
    const [resultado] = await db.query(sql, [
      nombre, especie, edad, peso, energia, sociabilidad, emoji, descripcion, estado, idAnimal
    ]);
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }
    
    res.json({ mensaje: 'Ficha del animal actualizada correctamente' });
    
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

// RUTA PARA AÑADIR EXPERIENCIA AL USUARIO (PUT)
app.put('/api/usuarios/:id/xp', async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const { puntosAgregados } = req.body;

    const [usuarios] = await db.query('SELECT xp, nivel FROM usuarios WHERE id = ?', [idUsuario]);
    if (usuarios.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    let nuevaXp = usuarios[0].xp + puntosAgregados;
    let nivelAnterior = usuarios[0].nivel;

    // FÓRMULA EXPONENCIAL INVERSA: Calculamos el nivel en base a la XP total
    // Si: XP = 100 * (Nivel - 1)^1.5
    // Entonces: Nivel = (XP / 100)^(1 / 1.5) + 1
    let nuevoNivelCalculado = Math.floor(Math.pow(nuevaXp / 100, 1 / 1.5)) + 1;

    // Actualizar en la base de datos
    await db.query(
      'UPDATE usuarios SET xp = ?, nivel = ? WHERE id = ?',
      [nuevaXp, nuevoNivelCalculado, idUsuario]
    );

    res.json({ 
      mensaje: 'Experiencia actualizada', 
      xp: nuevaXp, 
      nivel: nuevoNivelCalculado,
      subidaNivel: nuevoNivelCalculado > nivelAnterior
    });

  } catch (error) {
    console.error('Error al actualizar XP:', error);
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
// ARRANQUE DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API ShelterDex corriendo en http://localhost:${PORT}`);
});