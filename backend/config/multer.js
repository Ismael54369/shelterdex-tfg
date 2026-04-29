import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// ==========================================
// CONFIGURACIÓN DE IMÁGENES (Multer + Cloudinary)
// ==========================================
// Si las credenciales de Cloudinary están configuradas, las imágenes se suben a la nube.
// Si no, se guardan en disco local (modo desarrollo con XAMPP).

const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

let upload;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const cloudStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'shelterdex',           // Carpeta en Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit' }],  // Limitar ancho para no gastar cuota
    },
  });

  upload = multer({ storage: cloudStorage, limits: { fileSize: 5 * 1024 * 1024 } });
  console.log('[Cloudinary] Imágenes se subirán a la nube.');
} else {
  // Modo local: guardar en disco
  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
      const nombreUnico = Date.now() + path.extname(file.originalname);
      cb(null, nombreUnico);
    }
  });

  const filtroImagenes = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (tiposPermitidos.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG, PNG o WebP.'), false);
  };

  upload = multer({ storage: localStorage, fileFilter: filtroImagenes, limits: { fileSize: 5 * 1024 * 1024 } });
  console.log('[Imágenes] Modo local: guardando en carpeta uploads/.');
}

// Helper: obtener la URL/ruta de un archivo subido.
// En Cloudinary: req.file.path es la URL completa (https://res.cloudinary.com/...)
// En local: construimos la ruta relativa /uploads/nombre.jpg
function obtenerRutaImagen(file) {
  if (!file) return null;
  if (useCloudinary) return file.path;       // URL completa de Cloudinary
  return `/uploads/${file.filename}`;         // Ruta relativa local
}

// Helper: extraer el public_id de Cloudinary desde una URL para poder borrar la imagen.
// Ejemplo: "https://res.cloudinary.com/xxx/image/upload/v123/shelterdex/abc123.jpg"
//       → "shelterdex/abc123"
function obtenerPublicId(url) {
  if (!url || !url.includes('cloudinary.com')) return null;
  const partes = url.split('/upload/');
  if (partes.length < 2) return null;
  const despuesDeUpload = partes[1]; // "v123/shelterdex/abc123.jpg"
  // Quitar la versión (v123/) si existe
  const sinVersion = despuesDeUpload.replace(/^v\d+\//, '');
  // Quitar la extensión
  return sinVersion.replace(/\.[^.]+$/, '');
}

export { upload, obtenerRutaImagen, obtenerPublicId, useCloudinary, cloudinary };