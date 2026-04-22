# ShelterDex — Frontend (React SPA)

Interfaz de usuario de ShelterDex construida como una Single Page Application (SPA) con React y Vite. Diseño responsive mobile-first con una estética retro-gaming inspirada en Pokémon, implementada con TailwindCSS.

---

## Stack

| Tecnología | Uso |
|------------|-----|
| **React 18** | UI con componentes funcionales y hooks |
| **Vite** | Bundler y servidor de desarrollo |
| **TailwindCSS** | Estilos utility-first con tema personalizado |
| **React Router v6** | Navegación SPA con rutas protegidas |
| **React Hot Toast** | Notificaciones tipo toast |
| **Recharts** | Gráficos interactivos en el dashboard admin |
| **@paypal/react-paypal-js** | SDK oficial de PayPal para el botón de donación |

---

## Instalación

```bash
cd frontend
npm install
cp .env.example .env
# Editar .env con tus valores
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del backend (sin barra al final) | `http://localhost:3000` |
| `VITE_PAYPAL_CLIENT_ID` | Client ID de PayPal Sandbox | (opcional) |

Las variables de Vite deben empezar por `VITE_` para ser accesibles en el cliente. Tras modificar `.env` es necesario reiniciar el servidor de desarrollo.

---

## Configuración centralizada

Todas las llamadas a la API pasan por el helper `src/config/api.js`:

```javascript
import { API_URL, urlImagen } from '../config/api';

// Peticiones a la API
fetch(`${API_URL}/api/animales`)

// Imágenes (soporta rutas locales y URLs de Cloudinary)
<img src={urlImagen(animal.imagen)} />
```

Este patrón permite cambiar entre desarrollo y producción tocando solo el `.env`, sin modificar código.

---

## Estructura de archivos

```
frontend/src/
├── config/
│   └── api.js                 # API_URL + urlImagen() centralizado
├── components/
│   ├── Header.jsx             # Navegación sticky con avatar e indicador de ruta
│   ├── Footer.jsx             # 4 columnas: branding, plataforma, legal, contacto
│   └── RutaProtegida.jsx      # HOC que verifica JWT y rol antes de renderizar
├── pages/
│   ├── Home.jsx               # Landing: hero, stats en vivo, animales destacados, CTA
│   ├── Animales.jsx           # Catálogo público con filtros y buscador
│   ├── DetalleAnimal.jsx      # Ficha individual: galería, adopción, animales relacionados
│   ├── Login.jsx              # Login/Registro con diseño Pokéball y validación de contraseña
│   ├── DashboardVoluntario.jsx # Panel: registrar tareas, historial, ranking, perfil con XP
│   ├── AdminDashboard.jsx     # Panel con 5 pestañas: animales, tareas, stats, adopciones, informes
│   ├── Donaciones.jsx         # Pasarela: tarjeta (Luhn), Bizum (simulación), PayPal (SDK real)
│   ├── Faq.jsx                # Preguntas frecuentes con acordeones
│   ├── Soporte.jsx            # Formulario de contacto/tickets
│   ├── Terminos.jsx           # Términos de uso
│   ├── Privacidad.jsx         # Política de privacidad
│   └── Cookies.jsx            # Política de cookies
├── App.jsx                    # Router principal con todas las rutas
└── index.css                  # Estilos globales y clase .scrollbar-hide
```

---

## Páginas y funcionalidades

### Zona pública

| Página | Ruta | Descripción |
|--------|------|-------------|
| Home | `/` | Landing page con contadores en vivo desde la API, sección "Cómo funciona", animales destacados y CTAs |
| Catálogo | `/animales` | Grid de tarjetas de animales con buscador, filtro por especie y estado, y barras de energía/sociabilidad |
| Detalle | `/animales/:id` | Galería con flechas y miniaturas, formulario de adopción, barras de stats, animales relacionados |
| Donaciones | `/donaciones` | Selector de importe, 3 métodos de pago (tarjeta con Luhn, Bizum con simulación realista, PayPal con SDK oficial) |
| Login | `/login` | Toggle login/registro, validación de contraseña, diseño temático Pokéball |
| FAQ | `/faq` | Acordeones interactivos |
| Soporte | `/soporte` | Formulario de tickets con layout responsive |
| Legal | `/terminos`, `/privacidad`, `/cookies` | Páginas legales con diseño unificado |

### Zona privada — Voluntario

| Página | Ruta | Acceso |
|--------|------|--------|
| Dashboard | `/dashboard` | Login requerido |

Funcionalidades: selección de animal y tarea desde desplegable, historial de tareas (últimas 20), ranking con medallas (oro/plata/bronce), tarjeta "Tu Resumen" con posición en ranking y XP hasta siguiente nivel, barra de progreso de XP.

### Zona privada — Admin

| Página | Ruta | Acceso |
|--------|------|--------|
| Admin Dashboard | `/admin` | Login + rol admin |

5 pestañas con navegación por iconos (móvil) o icono+texto (desktop):

1. **Animales:** tabla con foto, búsqueda, filtros, CRUD completo, galería de imágenes con subida múltiple y sistema de portada, sliders de energía/sociabilidad.
2. **Validar Tareas:** bandeja de pendientes con botones aprobar/rechazar, feedback con XP otorgada y efecto en stats del animal.
3. **Estadísticas:** KPIs, gráfico de tarta (animales por estado), barras (ranking, tareas populares) con Recharts.
4. **Adopciones:** bandeja de solicitudes con datos del solicitante y del animal.
5. **Informes:** generación y descarga de PDFs de animales (filtrable) y voluntarios.

---

## Diseño y estética

**Tema retro-gaming** con colores personalizados definidos en `tailwind.config.js`:

| Color | Variable | Uso |
|-------|----------|-----|
| Rojo | `pokeRed` | CTAs primarios, errores, alertas |
| Azul | `pokeBlue` | Acciones secundarias, sociabilidad |
| Amarillo | `pokeYellow` | Highlights, energía, hovers |
| Oscuro | `pokeDark` | Texto principal, bordes, fondos oscuros |
| Claro | `pokeLight` | Fondos de formularios, fondos suaves |

**Patrones visuales recurrentes:**
- `font-retro` — fuente pixel para títulos y botones principales.
- `poke-card` — clase CSS para tarjetas con borde y sombra retro.
- `shadow-[3px_3px_0px_0px_#222224]` — sombra retro unificada en hovers.
- `border-4 border-pokeDark rounded-lg` — patrón de bordes en botones primarios.
- Responsive mobile-first con breakpoints `sm:`, `md:`, `lg:`.

---

## Autenticación

El token JWT se almacena en `localStorage` bajo la clave `tokenShelterDex`. Los helpers `authHeaders()` y `authHeadersJSON()` del `AdminDashboard.jsx` envían el token en las cabeceras de las peticiones protegidas. El componente `RutaProtegida.jsx` verifica la existencia del token y opcionalmente el rol antes de renderizar páginas privadas.

---

## Despliegue

El frontend está desplegado en **Vercel** con deploy automático desde GitHub. Las variables de entorno (`VITE_API_URL` y `VITE_PAYPAL_CLIENT_ID`) se configuran en el panel de Vercel. Cada push a la rama principal dispara un nuevo build y deploy.
