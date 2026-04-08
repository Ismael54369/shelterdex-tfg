import { Link } from 'react-router-dom';

// Datos temporales simulando lo que nos devolverá la Base de Datos en el futuro
const animalesMock = [
  { id: 1, nombre: 'Rex', especie: 'Perro', energia: 80, sociabilidad: 60, emoji: '🐶' },
  { id: 2, nombre: 'Luna', especie: 'Gato', energia: 40, sociabilidad: 90, emoji: '🐱' },
  { id: 3, nombre: 'Toby', especie: 'Perro', energia: 95, sociabilidad: 50, emoji: '🐕' },
  { id: 4, nombre: 'Milo', especie: 'Gato', energia: 30, sociabilidad: 80, emoji: '🐈' },
];

function Animales() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      
      <div className="flex justify-between items-end mb-8 border-b-4 border-pokeDark pb-4 mt-6">
        <div>
          <h1 className="text-3xl font-retro text-pokeRed mb-2">Poké... digo, ¡Adopciones!</h1>
          <p className="text-lg font-bold text-gray-700">Encuentra a tu compañero ideal.</p>
        </div>
      </div>

      {/* Grid de tarjetas de animales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {animalesMock.map((animal) => (
          <div key={animal.id} className="poke-card p-4 flex flex-col">
            
            {/* Foto simulada con un recuadro retro y un emoji */}
            <div className="bg-pokeLight border-4 border-pokeDark rounded-lg h-40 flex items-center justify-center text-6xl mb-4 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]">
              {animal.emoji}
            </div>

            {/* Nombre y Especie */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-retro text-pokeDark">{animal.nombre}</h2>
              <span className="bg-gray-200 text-pokeDark text-xs font-bold px-2 py-1 rounded-full border-2 border-pokeDark uppercase">
                {animal.especie}
              </span>
            </div>

            {/* Estadísticas (Barras de progreso) */}
            <div className="space-y-3 mb-6 flex-grow font-bold text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Energía (PS)</span>
                  <span>{animal.energia}/100</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3 border-2 border-pokeDark">
                  <div className="bg-pokeYellow h-full rounded-full" style={{ width: `${animal.energia}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Sociabilidad</span>
                  <span>{animal.sociabilidad}/100</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3 border-2 border-pokeDark">
                  <div className="bg-pokeBlue h-full rounded-full" style={{ width: `${animal.sociabilidad}%` }}></div>
                </div>
              </div>
            </div>

            {/* Botón de acción */}
            <Link 
              to={`/animales/${animal.id}`}
              className="w-full bg-pokeRed text-white font-retro text-sm py-3 rounded border-4 border-pokeDark hover:bg-pokeYellow hover:text-pokeDark transition-colors text-center block"
            >
              Ver Ficha
            </Link>
            
          </div>
        ))}
      </div>

    </div>
  );
}

export default Animales;