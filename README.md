# ShelterDex — Plataforma Gamificada de Gestión de Refugios de Animales

Aplicación web Full-Stack que digitaliza la gestión integral de un refugio de animales, combinando un sistema de administración profesional con mecánicas de gamificación inspiradas en el universo Pokémon.

**Proyecto de Fin de Grado** — Ismael González Tempa — 2º DAW — IES Playamar (Málaga)

🌐 **Producción:** https://shelterdex-tfg.vercel.app
📦 **Repositorio:** https://github.com/Ismael54369/shelterdex-tfg

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
│   ├── config/
│   │   ├── multer.js             # Configuración Multer + Cloudinary (dual-mode)
│   │   └── paypal.js             # Cliente PayPal SDK + middleware disponibilidad
│   ├── middleware/
│   │   └── auth.js               # verificarToken + verificarAdmin (JWT)
│   ├── routes/
│   │   ├── adopciones.js         # Solicitud, pendientes, revisión de adopciones
│   │   ├── animales.js           # CRUD animales + galería de imágenes
│   │   ├── auth.js               # Login y registro con bcrypt + JWT
│   │   ├── informes.js           # Generación de PDFs (animales + voluntarios)
│   │   ├── paypal.js             # Crear y capturar órdenes PayPal
│   │   ├── stats.js              # Stats públicas, perfil, ranking, dashboard admin
│   │   └── tareas.js             # Gamificación: catálogo, registro, revisión, historial
│   ├── index.js                  # Orquestador (~100 líneas): montaje de routers
│   ├── db.js                     # Pool de conexión MySQL con soporte SSL
│   ├── ca.pem                    # Certificado CA de Aiven
│   ├── .env.example              # Plantilla de variables de entorno
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js            # Helper centralizado API_URL + urlImagen()
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── useAdminData.js    # Custom hook: estados + lógica del panel admin
│   │   │   │   ├── adminHelpers.js    # authHeaders() + authHeadersJSON()
│   │   │   │   ├── SliderStat.jsx     # Slider energía/sociabilidad (0-100)
│   │   │   │   ├── ModalCrear.jsx     # Modal formulario crear animal
│   │   │   │   ├── ModalEditar.jsx    # Modal formulario editar animal
│   │   │   │   ├── ModalGaleria.jsx   # Modal galería de imágenes
│   │   │   │   ├── TabAnimales.jsx    # Tabla + filtros + búsqueda
│   │   │   │   ├── TabTareas.jsx      # Bandeja de validación de tareas
│   │   │   │   ├── TabAdopciones.jsx  # Solicitudes de adopción
│   │   │   │   ├── TabEstadisticas.jsx # KPIs + gráficos Recharts
│   │   │   │   └── TabInformes.jsx    # Descarga de informes PDF
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── RutaProtegida.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Animales.jsx
│   │   │   ├── DetalleAnimal.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx    # Orquestador (~130 líneas)
│   │   │   ├── DashboardVoluntario.jsx
│   │   │   ├── Donaciones.jsx
│   │   │   ├── Faq.jsx
│   │   │   ├── Soporte.jsx
│   │   │   ├── Terminos.jsx
│   │   │   ├── Privacidad.jsx
│   │   │   └── Cookies.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── .env.example              # Plantilla de variables de entorno
│   └── package.json
├── shelterdex_db.sql              # Script de instalación de la BD
└── README.md                      # Este archivo
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
# Editar .env con tus credenciales de BD, JWT_SECRET, etc.
npm start
```

### 4. Configurar el frontend

```bash
cd ../frontend
npm install
cp .env.example .env
# Editar .env: VITE_API_URL=http://localhost:3000
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@shelterdex.com | Admin1234 |
| Voluntario | maria@shelterdex.com | Maria1234 |

---

## Licencia

Proyecto académico — Todos los derechos reservados © 2026 Ismael González Tempa
