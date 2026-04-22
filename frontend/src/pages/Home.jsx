import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, urlImagen } from '../config/api';

function Home() {
  const [stats, setStats] = useState(null);
  const [animalesDestacados, setAnimalesDestacados] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/stats/publicas`)
      .then(res => res.json())
      .then(datos => setStats(datos))
      .catch(() => {});

    fetch(`${API_URL}/api/animales`)
      .then(res => res.json())
      .then(datos => {
        if (Array.isArray(datos)) {
          setAnimalesDestacados(datos.filter(a => a.estado === 'Refugio').slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>

      {/* ==================== HERO ==================== */}
      <section className="bg-gradient-to-b from-pokeRed/10 to-transparent">
        <div className="container mx-auto px-4 py-12 sm:py-20 flex flex-col items-center text-center">
          
          <div className="bg-pokeRed/10 text-pokeRed font-bold text-xs sm:text-sm px-4 py-2 rounded-full border-2 border-pokeRed/30 mb-6 uppercase tracking-wider">
            🐾 Plataforma Gamificada para Refugios
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-retro text-pokeDark mb-4 sm:mb-6 leading-tight max-w-4xl">
            Dale un hogar a quien
            <span className="text-pokeRed"> más lo necesita</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl font-bold leading-relaxed px-2">
            ShelterDex combina la gestión profesional de un refugio de animales con un sistema de gamificación que motiva a los voluntarios a dar lo mejor de sí.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link 
              to="/animales" 
              className="bg-pokeRed text-white font-retro text-xs sm:text-sm px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg border-4 border-pokeDark hover:bg-pokeYellow hover:text-pokeDark hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_#222224] transition-all text-center"
            >
              Ver Animales en Adopción
            </Link>
            <Link 
              to="/login" 
              className="bg-white text-pokeDark font-retro text-xs sm:text-sm px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg border-4 border-pokeDark hover:bg-pokeDark hover:text-white hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_#222224] transition-all text-center"
            >
              Únete como Voluntario
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== STATS EN VIVO ==================== */}
      {stats && (
        <section className="bg-pokeDark py-8 sm:py-12 border-y-8 border-pokeRed">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
              {[
                { valor: stats.totalAnimales, label: 'Animales Registrados', icono: '🐾' },
                { valor: stats.totalAdoptados, label: 'Adoptados con Éxito', icono: '🏠' },
                { valor: stats.totalVoluntarios, label: 'Voluntarios Activos', icono: '👥' },
                { valor: stats.tareasCompletadas, label: 'Tareas Completadas', icono: '✅' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl mb-1">{stat.icono}</p>
                  <p className="text-2xl sm:text-4xl font-retro text-pokeYellow">{stat.valor}</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== CÓMO FUNCIONA ==================== */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <h2 className="text-xl sm:text-3xl font-retro text-pokeDark text-center mb-3">¿Cómo funciona?</h2>
        <p className="text-center text-gray-500 font-bold mb-8 sm:mb-12 max-w-lg mx-auto">Tres sencillos pasos para empezar a cambiar vidas.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {[
            {
              paso: '01',
              titulo: 'Regístrate',
              descripcion: 'Crea tu cuenta de voluntario en segundos. Solo necesitas un email y una contraseña segura.',
              color: 'bg-pokeRed',
              icono: '🎮'
            },
            {
              paso: '02',
              titulo: 'Completa Tareas',
              descripcion: 'Pasea perros, alimenta gatos, limpia recintos... Cada acción se registra y un admin la valida.',
              color: 'bg-pokeBlue',
              icono: '📋'
            },
            {
              paso: '03',
              titulo: 'Sube de Nivel',
              descripcion: 'Gana XP por cada tarea aprobada. Escala en el ranking y demuestra tu compromiso con el refugio.',
              color: 'bg-green-500',
              icono: '⚡'
            }
          ].map((item, i) => (
            <div key={i} className="poke-card p-6 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <span className="absolute -top-4 -right-2 text-8xl font-retro text-gray-100 group-hover:text-gray-200 transition-colors select-none">{item.paso}</span>
              
              <div className={`${item.color} w-16 h-16 rounded-full border-4 border-pokeDark mb-4 flex items-center justify-center text-2xl shadow-[inset_-4px_-4px_0px_rgba(0,0,0,0.2)] relative z-10`}>
                {item.icono}
              </div>
              <h3 className="text-lg font-retro text-pokeDark mb-2 relative z-10">{item.titulo}</h3>
              <p className="font-semibold text-gray-600 text-sm relative z-10">{item.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== ANIMALES DESTACADOS ==================== */}
      {animalesDestacados.length > 0 && (
        <section className="bg-pokeLight/50 py-12 sm:py-20 border-y-4 border-pokeDark/10">
          <div className="container mx-auto px-4">
            <h2 className="text-xl sm:text-3xl font-retro text-pokeDark text-center mb-3">Esperando un Hogar</h2>
            <p className="text-center text-gray-500 font-bold mb-8 sm:mb-12 max-w-lg mx-auto">Estos compañeros buscan a alguien como tú.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {animalesDestacados.map((animal) => (
                <Link to={`/animales/${animal.id}`} key={animal.id} className="poke-card overflow-hidden group hover:-translate-y-2 transition-transform">
                  <div className="h-48 bg-pokeLight flex items-center justify-center overflow-hidden">
                    {animal.imagen
                      ? <img src={urlImagen(animal.imagen)} alt={animal.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <span className="text-7xl">{animal.emoji}</span>
                    }
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-retro text-pokeDark text-lg">{animal.nombre}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8 sm:mt-12">
              <Link 
                to="/animales" 
                className="inline-block bg-pokeDark text-white font-retro text-xs sm:text-sm px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg border-4 border-pokeDark hover:bg-pokeRed hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#222224] transition-all"
              >
                Ver Todos los Animales
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ==================== CARACTERÍSTICAS ==================== */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <h2 className="text-xl sm:text-3xl font-retro text-pokeDark text-center mb-3">¿Por qué ShelterDex?</h2>
        <p className="text-center text-gray-500 font-bold mb-8 sm:mb-12 max-w-lg mx-auto">La herramienta que tu refugio necesita.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {[
            { icono: '🔒', titulo: 'Seguro', desc: 'Autenticación JWT, contraseñas encriptadas con bcrypt y validación en servidor.' },
            { icono: '📊', titulo: 'Datos Reales', desc: 'Dashboard con gráficos en tiempo real. Exporta informes PDF con un clic.' },
            { icono: '📱', titulo: 'Responsive', desc: 'Diseñado Mobile First. Funciona perfecto en móvil, tablet y escritorio.' },
            { icono: '🎯', titulo: 'Gamificado', desc: 'Sistema de XP exponencial con niveles y ranking. Motiva a tus voluntarios.' },
          ].map((feat, i) => (
            <div key={i} className="bg-white border-4 border-pokeDark/10 rounded-xl p-5 hover:border-pokeDark transition-colors group">
              <span className="text-3xl mb-3 block">{feat.icono}</span>
              <h3 className="font-retro text-pokeDark text-sm mb-2">{feat.titulo}</h3>
              <p className="text-sm font-semibold text-gray-500">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CTA FINAL ==================== */}
      <section className="bg-pokeRed py-12 sm:py-16 border-y-8 border-pokeDark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-3xl font-retro text-white mb-4">¿Listo para marcar la diferencia?</h2>
          <p className="text-white/80 font-bold mb-8 max-w-lg mx-auto">Cada tarea completada acerca a un animal a su hogar definitivo. Únete a la comunidad de voluntarios.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/login" 
              className="bg-pokeYellow text-pokeDark font-retro text-xs sm:text-sm px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg border-4 border-pokeDark hover:bg-white hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_#222224] transition-all text-center"
            >
              Crear Cuenta Gratis
            </Link>
            <Link 
              to="/donaciones" 
              className="bg-transparent text-white font-retro text-xs sm:text-sm px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg border-4 border-white hover:bg-white hover:text-pokeRed hover:-translate-y-1 transition-all text-center"
            >
              Hacer una Donación
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;