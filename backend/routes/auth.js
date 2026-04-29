import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = Router();

// RUTA PARA REGISTRAR (POST)
router.post('/registro', async (req, res) => {
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
router.post('/login', async (req, res) => {
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

export default router;