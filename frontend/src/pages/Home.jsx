import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mx-auto p-4">
      
      {/* Sección Hero (Cabecera principal) */}
      <section className="flex flex-col items-center text-center mt-10 mb-16">
<h1 className="text-2xl sm:text-4xl md:text-5xl font-retro text-pokeRed mb-4 sm:mb-6 drop-shadow-[3px_3px_0px_#222224] leading-tight">          ¡Atrapa a tu nuevo <br/> mejor amigo!
        </h1>
        <p className="text-base sm:text-xl md:text-2xl text-pokeDark mb-6 sm:mb-8 max-w-2xl font-bold px-2">
          El primer software de gestión para refugios con gamificación. Sube de nivel, completa tareas y ayuda a los animales a encontrar su hogar ideal.
        </p>
        <Link 
          to="/animales" 
          className="bg-pokeBlue text-white text-base sm:text-xl font-retro px-6 sm:px-8 py-3 sm:py-4 rounded-full border-4 border-pokeDark hover:bg-pokeYellow hover:text-pokeDark hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#222224] transition-all"
        >
          Ver Adopciones
        </Link>
      </section>

      {/* Sección de Características (Usando nuestra clase poke-card) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto px-2">
        
        <div className="poke-card p-6 flex flex-col items-center text-center">
          <div className="bg-pokeRed w-16 h-16 rounded-full border-4 border-pokeDark mb-4 flex items-center justify-center shadow-[inset_-4px_-4px_0px_rgba(0,0,0,0.2)]">
            {/* Simulamos el centro de una Pokeball con CSS */}
            <div className="bg-white w-6 h-6 rounded-full border-2 border-pokeDark"></div>
          </div>
          <h2 className="text-xl font-retro text-pokeDark mb-3">Gestión B2B</h2>
          <p className="font-semibold text-gray-700">
            Control total de tu refugio. Administra fichas médicas, estados de adopción y voluntarios desde un único panel.
          </p>
        </div>

        <div className="poke-card p-6 flex flex-col items-center text-center">
          <div className="bg-pokeYellow w-16 h-16 rounded-full border-4 border-pokeDark mb-4 flex items-center justify-center text-2xl font-retro text-pokeDark">
            XP
          </div>
          <h2 className="text-xl font-retro text-pokeDark mb-3">Gamificación</h2>
          <p className="font-semibold text-gray-700">
            Fideliza a tus voluntarios. Gana experiencia al pasear perros o limpiar jaulas y desbloquea logros exclusivos.
          </p>
        </div>

        <div className="poke-card p-6 flex flex-col items-center text-center">
          <div className="bg-pokeBlue w-16 h-16 rounded-full border-4 border-pokeDark mb-4 flex items-center justify-center text-white text-3xl font-retro">
            ?
          </div>
          <h2 className="text-xl font-retro text-pokeDark mb-3">Adopciones</h2>
          <p className="font-semibold text-gray-700">
            Catálogo público optimizado. Muestra a los animales con sus estadísticas de energía y sociabilidad.
          </p>
        </div>

      </section>
    </div>
  );
}

export default Home;