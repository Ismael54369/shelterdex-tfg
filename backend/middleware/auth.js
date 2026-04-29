import jwt from 'jsonwebtoken';

// Middleware que verifica que el usuario tiene un token válido
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // El header viene como "Bearer <token>", extraemos solo el token
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token de autenticación.' });
  }

  try {
    // jwt.verify lanza un error si el token es inválido o ha expirado
    const datosUsuario = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = datosUsuario; // Guardamos los datos del usuario (id, rol, nombre) para usarlos en la ruta
    next(); // Continuamos a la siguiente función (la ruta real)
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

// Middleware que verifica que además de estar logueado, el usuario es Admin
const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

export { verificarToken, verificarAdmin };