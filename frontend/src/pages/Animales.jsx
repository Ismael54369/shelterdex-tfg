import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Animales() {
  const [animales, setAnimales] = useState([]);
  const [filtro, setFiltro] = useState('Todos');

  useEffect(() => {
    fetch('http://localhost:3000/api/animales')
      .then(res => res.json())
      .then(datos => {
        if (Array.isArray(datos)) setAnimales(datos);
      })
      .catch(error => console.error('Error cargando animales:', error));
  }, []);

  // Filtramos según la especie seleccionada
  const animalesFiltrados = filtro === 'Todos' 
    ? animales 
    : animales.filter(a => a.especie === filtro);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-4 border-pokeDark pb-4 mt-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-retro text-pokeRed mb-2">Poké... digo, ¡Adopciones!</h1>
          <p className="text-lg font-bold text-gray-700">Encuentra a tu compañero ideal.</p>
        </div>

        {/* Filtro por especie */}
        <div className="flex gap-2 flex-wrap">
          {['Todos', 'Perro', 'Gato', 'Otro'].map((opcion) => (
            <button
              key={opcion}
              onClick={() => setFiltro(opcion)}
              className={`font-bold text-sm px-4 py-2 rounded border-2 transition-colors ${
                filtro === opcion
                  ? 'bg-pokeDark text-white border-pokeDark'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-pokeDark'
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de tarjetas de animales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {animalesFiltrados.map((animal) => (
          <div key={animal.id} className="poke-card p-4 flex flex-col">
            
            {/* Foto o emoji como fallback */}
            <div className="bg-pokeLight border-4 border-pokeDark rounded-lg h-40 flex items-center justify-center mb-4 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden">
              {animal.imagen 
                ? <img src={`http://localhost:3000${animal.imagen}`} alt={animal.nombre} className="w-full h-full object-cover" />
                : <span className="text-6xl">{animal.emoji}</span>
              }
            </div>

            {/* Nombre y Especie */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-retro text-pokeDark">{animal.nombre}</h2>
              <span className="bg-gray-200 text-pokeDark text-xs font-bold px-2 py-1 rounded-full border-2 border-pokeDark uppercase">
                {animal.especie}
              </span>
            </div>

            {/* Estado */}
            <div className="mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                animal.estado === 'Refugio' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                animal.estado === 'Acogida' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                'bg-green-100 text-green-700 border border-green-300'
              }`}>
                {animal.estado}
              </span>
            </div>

            {/* Estadísticas */}
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

      {animalesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl font-bold text-gray-500">No hay animales que coincidan con el filtro.</p>
        </div>
      )}

    </div>
  );
}

export default Animales;