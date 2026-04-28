# ShelterDex

**Plataforma gamificada de gestión para refugios de animales.**

ShelterDex es una aplicación web Full-Stack que digitaliza la gestión integral de un refugio de animales, combinando un sistema de administración profesional con mecánicas de gamificación que motivan a los voluntarios mediante puntos de experiencia (XP), niveles y rankings.

> **TFG — Desarrollo de Aplicaciones Web (DAW)**
> IES Playamar, Málaga · Curso 2025/2026
> Autor: Ismael González Tempa

---

## Demo en producción

| Servicio | URL |
|----------|-----|
| Frontend | [shelterdex-tfg.vercel.app](https://shelterdex-tfg.vercel.app) |
| API | [shelterdex-api.onrender.com](https://shelterdex-api.onrender.com) |

**Credenciales de prueba:**

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@shelterdex.es` | `Pikachu2026` |
| Voluntario | `ismael@gmail.com` | `Ismael2026` |

> Nota: El backend en Render puede tardar ~30s en responder la primera petición si lleva tiempo inactivo (cold start del free tier).

---

## Características principales

**Gestión de animales:** CRUD completo con galería de imágenes múltiples, sistema de portada, estadísticas de energía/sociabilidad editables y búsqueda con filtros por especie y estado.

**Sistema de gamificación:** Los voluntarios registran tareas con los animales del refugio. Un administrador las aprueba o rechaza. Al aprobar, el voluntario gana XP calculada con una fórmula exponencial (`Nivel = floor((XP/100)^(1/1.5)) + 1`) y las estadísticas del animal se modifican automáticamente según el tipo de tarea.

**Flujo de adopción:** Formulario público de solicitud, bandeja de validación para el admin y cambio automático del estado del animal a "Adoptado" al aprobar.

**Pasarela de donaciones:** Integración real con PayPal Sandbox (creación y captura de órdenes server-side), simulación de tarjeta con validación Luhn y simulación realista de Bizum con flujo de 3 fases.

**Informes PDF:** Generación en tiempo real de informes de animales (filtrable por estado) y de voluntarios (ranking + resumen de tareas) con PDFKit.

**Dashboard analítico:** Gráficos interactivos con Recharts (tarta de animales por estado, barras de ranking, tareas populares) y KPIs en tiempo real.

---

## Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel     │────▶│   Render    │────▶│   Aiven     │     │ Cloudinary  │
│  (Frontend)  │     │  (Backend)  │     │  (MySQL)    │     │ (Imágenes)  │
│  React/Vite  │     │  Node/Express│     │  Free tier  │     │  Free tier  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

**Regla de oro del proyecto:** la lógica de negocio y la seguridad residen siempre en el backend. El frontend es un presentador.

---

## Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18, Vite, TailwindCSS, React Router, React Hot Toast, Recharts, @paypal/react-paypal-js |
| **Backend** | Node.js, Express, JWT (jsonwebtoken), bcryptjs, Multer, PDFKit, Cloudinary, @paypal/paypal-server-sdk |
| **Base de datos** | MySQL 8 (Aiven) |
| **Infraestructura** | Vercel (frontend), Render (backend), Aiven (BD), Cloudinary (imágenes), UptimeRobot (monitorización) |

---

## Estructura del proyecto

```
shelterdex-tfg/
├── backend/
│   ├── index.js              # Servidor Express + todos los endpoints
│   ├── db.js                 # Pool de conexión MySQL con soporte SSL
│   ├── ca.pem                # Certificado CA de Aiven
│   ├── uploads/              # Imágenes locales (desarrollo)
│   ├── .env                  # Variables de entorno (no en Git)
│   ├── .env.example          # Plantilla de variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js        # Helper centralizado API_URL + urlImagen()
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── RutaProtegida.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Animales.jsx
│   │   │   ├── DetalleAnimal.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DashboardVoluntario.jsx
│   │   │   ├── Donaciones.jsx
│   │   │   ├── Faq.jsx
│   │   │   ├── Soporte.jsx
│   │   │   ├── Terminos.jsx
│   │   │   ├── Privacidad.jsx
│   │   │   └── Cookies.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── .env                  # Variables de entorno (no en Git)
│   ├── .env.example          # Plantilla de variables
│   └── package.json
├── shelterdex_db.sql          # Script de instalación de la BD
└── README.md                  # Este archivo
```

---

## Instalación local

### Requisitos previos

- Node.js 18+ y npm
- MySQL 8 o MariaDB 10.4+ (ej: XAMPP)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/Ismael54369/shelterdex-tfg.git
cd shelterdex-tfg
```

### 2. Configurar la base de datos

Crea una base de datos llamada `shelterdex_db` en tu servidor MySQL local e importa el script:

```bash
mysql -u root -p shelterdex_db < shelterdex_db.sql
```

### 3. Configurar el backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `backend/.env` con tus valores locales:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=shelterdex_db
DB_SSL=false
PORT=3000
JWT_SECRET=genera_un_secret_aleatorio
FRONTEND_URL=http://localhost:5173
```

Inicia el servidor:

```bash
npm run dev
```

Deberías ver: `Base de Datos MySQL conectada con éxito` y `API ShelterDex corriendo en http://localhost:3000`.

### 4. Configurar el frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edita `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Inicia el frontend:

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## Seguridad

- Contraseñas hasheadas con **bcrypt** (10 salt rounds).
- Autenticación mediante **JWT** almacenado en localStorage (clave: `tokenShelterDex`).
- Middlewares compuestos: `verificarToken` (usuario logueado) + `verificarAdmin` (solo admin).
- Validación server-side de todos los inputs (importes PayPal, formatos de imagen, datos de adopción).
- CORS dinámico configurado desde variable de entorno.
- Credenciales de servicios externos exclusivamente en `.env` (nunca en el código).

---

## 📄 Licencia

Proyecto académico desarrollado como Trabajo de Fin de Grado. Todos los derechos reservados.

© 2026 Ismael González Tempa — IES Playamar, Málaga.
