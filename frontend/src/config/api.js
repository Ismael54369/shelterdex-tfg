// ==========================================
// Configuración centralizada de la API
// ==========================================
// Todas las llamadas a la API deben usar API_URL o los helpers definidos aquí.
// Esto permite cambiar entre desarrollo y producción tocando solo .env.

// URL base del backend (sin barra al final)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Guardia de desarrollo: avisa si la variable no está configurada.
// En producción este warning quedará visible en la consola del navegador,
// lo cual es útil para diagnosticar despliegues mal configurados.
if (!import.meta.env.VITE_API_URL) {
  console.warn(
    '[config/api] VITE_API_URL no está definida. Usando fallback:', 
    API_URL
  );
}

// Helper para construir rutas absolutas a imágenes servidas por el backend.
// Ejemplo de uso: urlImagen(animal.imagen) → "http://localhost:3000/uploads/foto.jpg"
// Soporta dos formatos que maneja la BD:
//   - "/uploads/foto.jpg"  (ruta relativa empezando con /)
//   - "uploads/foto.jpg"   (ruta relativa sin /)
// Si la ruta ya es absoluta (empieza por http) se devuelve tal cual.
export function urlImagen(ruta) {
  if (!ruta) return null;
  if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
  const rutaNormalizada = ruta.startsWith('/') ? ruta : `/${ruta}`;
  return `${API_URL}${rutaNormalizada}`;
}