# ShelterDex — Backend (API REST)

API REST desarrollada con Node.js y Express que gestiona toda la lógica de negocio de ShelterDex: autenticación, CRUD de animales, gamificación, adopciones, donaciones con PayPal y generación de informes PDF.

---

## Stack

| Tecnología | Uso |
|------------|-----|
| **Node.js + Express** | Servidor HTTP y enrutamiento |
| **mysql2** | Conexión a MySQL con soporte de promesas y SSL |
| **jsonwebtoken** | Autenticación JWT |
| **bcryptjs** | Hashing de contraseñas |
| **Multer + Cloudinary** | Subida de imágenes (local en desarrollo, nube en producción) |
| **PDFKit** | Generación de informes PDF en tiempo real |
| **@paypal/paypal-server-sdk** | Creación y captura de órdenes PayPal server-side |
| **cors** | Control de acceso por origen con configuración dinámica |
| **dotenv** | Gestión de variables de entorno |

---

## Instalación

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus valores (ver sección Variables de entorno)
npm run dev
```

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Contraseña de MySQL | (vacío en local) |
| `DB_NAME` | Nombre de la base de datos | `shelterdex_db` |
| `DB_SSL` | Activar SSL (`true`/`false`) | `false` en local |
| `PORT` | Puerto del servidor Express | `3000` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | cadena aleatoria larga |
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary | (opcional en local) |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | (opcional en local) |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | (opcional en local) |
| `PAYPAL_CLIENT_ID` | Client ID de PayPal Sandbox | (opcional en local) |
| `PAYPAL_CLIENT_SECRET` | Client Secret de PayPal Sandbox | (opcional en local) |
| `PAYPAL_ENVIRONMENT` | Entorno de PayPal | `sandbox` |

Si las credenciales de Cloudinary no están configuradas, las imágenes se guardan en la carpeta `uploads/` en disco local. Si las de PayPal no están configuradas, los endpoints `/api/paypal/*` devuelven 503 pero el resto de la API funciona con normalidad.

---

## Endpoints de la API

### Públicos (sin autenticación)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/animales` | Listar todos los animales |
| `GET` | `/api/animales/:id` | Obtener un animal por ID |
| `GET` | `/api/animales/:id/imagenes` | Galería de imágenes de un animal |
| `GET` | `/api/tareas/catalogo` | Catálogo de tareas disponibles |
| `GET` | `/api/ranking` | Top 5 voluntarios por XP |
| `GET` | `/api/usuarios/:id/perfil` | XP y nivel de un usuario |
| `GET` | `/api/stats/publicas` | Contadores para la landing (animales, adoptados, voluntarios, tareas) |
| `POST` | `/api/registro` | Crear cuenta de voluntario |
| `POST` | `/api/login` | Iniciar sesión (devuelve JWT) |
| `POST` | `/api/adopciones/solicitar` | Solicitar adopción (sin login) |
| `POST` | `/api/paypal/crear-orden` | Crear orden de pago en PayPal |
| `POST` | `/api/paypal/capturar-orden/:orderID` | Capturar orden aprobada por el usuario |

### Protegidos con `verificarToken` (usuario logueado)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/tareas/registrar` | Registrar tarea (estado: pendiente) |
| `GET` | `/api/tareas/historial/:usuario_id` | Historial de tareas del voluntario |

### Protegidos con `verificarToken` + `verificarAdmin`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/animales` | Crear animal (con imagen) |
| `PUT` | `/api/animales/:id` | Editar animal (con imagen) |
| `DELETE` | `/api/animales/:id` | Borrar animal |
| `GET` | `/api/tareas/pendientes` | Tareas pendientes de revisión |
| `PUT` | `/api/tareas/revisar/:id` | Aprobar/rechazar tarea (suma XP + modifica stats del animal) |
| `GET` | `/api/adopciones/pendientes` | Solicitudes de adopción pendientes |
| `PUT` | `/api/adopciones/revisar/:id` | Aprobar/rechazar adopción |
| `POST` | `/api/animales/:id/imagenes` | Subir hasta 5 imágenes a la galería |
| `PUT` | `/api/imagenes/:id/portada` | Establecer imagen como portada |
| `DELETE` | `/api/imagenes/:id` | Borrar imagen (también de Cloudinary) |
| `GET` | `/api/admin/estadisticas` | Datos para gráficos del dashboard |
| `GET` | `/api/informes/animales?estado=X` | Generar PDF de animales |
| `GET` | `/api/informes/voluntarios` | Generar PDF de voluntarios |

---

## Base de datos

MySQL con 6 tablas en Tercera Forma Normal (3NF):

```
usuarios         → id, nombre, email, password, rol, xp, nivel
animales         → id, nombre, especie, edad, peso, energia, sociabilidad, emoji, imagen, descripcion, estado
catalogo_tareas  → id, nombre, recompensa_xp, efecto_energia, efecto_sociabilidad, frecuencia
registro_tareas  → id, usuario_id(FK), animal_id(FK), tarea_id(FK), estado, fecha_creacion
imagenes_animales → id, animal_id(FK), ruta, es_portada, fecha_subida
solicitudes_adopcion → id, animal_id(FK), nombre_solicitante, email, telefono, mensaje, estado, fecha_creacion
```

El script `shelterdex_db.sql` en la raíz del proyecto crea las tablas e inserta datos de prueba.

---

## Arquitectura de imágenes

El backend detecta automáticamente si Cloudinary está configurado:

- **Con Cloudinary (producción):** las imágenes se suben a la carpeta `shelterdex/` en Cloudinary. La BD almacena la URL completa (`https://res.cloudinary.com/...`). Al borrar una imagen, también se elimina de Cloudinary.
- **Sin Cloudinary (desarrollo):** las imágenes se guardan en `backend/uploads/` y se sirven estáticamente. La BD almacena la ruta relativa (`/uploads/xxx.jpg`).

El frontend usa el helper `urlImagen()` que maneja ambos formatos de forma transparente.

---

## Despliegue en producción

El backend está desplegado en **Render** (free tier) con las variables de entorno configuradas en el panel de Render. La base de datos está en **Aiven** (MySQL free tier con SSL obligatorio). La monitorización con **UptimeRobot** evita que Render duerma el servidor por inactividad.
