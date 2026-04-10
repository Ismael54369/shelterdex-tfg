import { Navigate } from 'react-router-dom';

function RutaProtegida({ children, rolRequerido }) {
  const token = localStorage.getItem('tokenShelterDex');
  const rol = localStorage.getItem('usuarioRol');

  // 1. Verificación de Autenticación: Si no hay token, expulsar al Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Verificación de Autorización: Si la ruta exige un rol y el usuario no lo tiene
  if (rolRequerido && rol !== rolRequerido) {
    // Redirigimos a la página principal por falta de permisos
    return <Navigate to="/" replace />; 
  }

  // Si pasa ambos controles, renderizamos la página solicitada
  return children;
}

export default RutaProtegida;