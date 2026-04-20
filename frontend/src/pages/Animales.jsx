import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, urlImagen } from '../config/api';

function Animales() {
  const [animales, setAnimales] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  useEffect(() => {
    fetch(`${API_URL}/api/animales`)
      .then(res => res.json())
      .then(datos => {
        if (Array.isArray(datos)) setAnimales(datos);
      })
      .catch(error => console.error('Error cargando animales:', error));
  }, []);

  const animalesFiltrados = animales.filter(animal => {
    const coincideBusqueda = animal.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEspecie = filtroEspecie === 'Todos' || animal.especie === filtroEspecie;
    const coincideEstado = filtroEstado === 'Todos' || animal.estado === filtroEstado;
    return coincideBusqueda && coincideEspecie && coincideEstado;
  });

  return (
    <div>

      {/* Cabecera */}
      <div className="bg-gradient-to-b from-pokeBlue/10 to-transparent">
        <div className="container mx-auto px-4 pt-8 sm:pt-12 pb-6 max-w-6xl">
          <h1 className="text-2xl sm:text-4xl font-retro text-pokeDark mb-2 text-center">Nuestros Compañeros</h1>
          <p className="text-center text-gray-500 font-bold mb-8 max-w-lg mx-auto">Cada uno tiene una historia. ¿Escribirás el próximo capítulo con ellos?</p>

          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="🔍 Buscar por nombre..."
                className="w-full p-3 border-4 border-pokeDark rounded-lg bg-white font-bold text-sm focus:outline-none focus:border-pokeBlue"
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pokeRed font-bold">✕</button>
              )}
            </div>
            <select
              value={filtroEspecie}
              onChange={(e) => setFiltroEspecie(e.target.value)}
              className="p-3 border-4 border-pokeDark rounded-lg bg-white font-bold text-sm focus:outline-none focus:border-pokeBlue"
            >
              <option value="Todos">Especie: Todos</option>
              <option value="Perro">🐶 Perro</option>
              <option value="Gato">🐱 Gato</option>
              <option value="Otro">🐾 Otro</option>
            </select>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="p-3 border-4 border-pokeDark rounded-lg bg-white font-bold text-sm focus:outline-none focus:border-pokeBlue"
            >
              <option value="Todos">Estado: Todos</option>
              <option value="Refugio">Refugio</option>
              <option value="Acogida">Acogida</option>
              <option value="Adoptado">Adoptado</option>
            </select>
          </div>

          {/* Contador */}
          <p className="text-center text-xs font-bold text-gray-400 mt-4">
            Mostrando {animalesFiltrados.length} de {animales.length} animales
          </p>
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {animalesFiltrados.map((animal) => (
            <Link 
              to={`/animales/${animal.id}`} 
              key={animal.id} 
              className="poke-card overflow-hidden group hover:-translate-y-2 hover:shadow-[6px_6px_0px_0px_#222224] transition-all"
            >
              {/* Foto */}
              <div className="aspect-[4/3] bg-pokeLight flex items-center justify-center overflow-hidden relative">
                {animal.imagen 
                  ? <img src={urlImagen(animal.imagen)} alt={animal.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <span className="text-7xl">{animal.emoji}</span>
                }
                {/* Badge de estado */}
                <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                  animal.estado === 'Refugio' ? 'bg-blue-500 text-white' :
                  animal.estado === 'Acogida' ? 'bg-yellow-400 text-pokeDark' :
                  'bg-green-500 text-white'
                }`}>
                  {animal.estado}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-retro text-pokeDark">{animal.nombre}</h2>
                  <span className="bg-gray-200 text-pokeDark text-xs font-bold px-2 py-1 rounded-full border-2 border-pokeDark uppercase">
                    {animal.especie}
                  </span>
                </div>

                {/* Stats compactas */}
                <div className="space-y-2 font-bold text-xs">
                  <div>
                    <div className="flex justify-between mb-1 text-gray-600">
                      <span>⚡ Energía</span>
                      <span>{animal.energia}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-pokeYellow h-full rounded-full transition-all" style={{ width: `${animal.energia}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-gray-600">
                      <span>💙 Sociabilidad</span>
                      <span>{animal.sociabilidad}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-pokeBlue h-full rounded-full transition-all" style={{ width: `${animal.sociabilidad}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* CTA sutil */}
                <div className="mt-4 text-center">
                  <span className="text-pokeRed font-retro text-xs group-hover:text-pokeDark transition-colors">
                    Ver ficha completa →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Estado vacío */}
        {animalesFiltrados.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-bold text-gray-500 mb-2">No se encontraron animales</p>
            <p className="text-sm text-gray-400 font-bold mb-4">Prueba con otros filtros o términos de búsqueda.</p>
            <button
              onClick={() => { setBusqueda(''); setFiltroEspecie('Todos'); setFiltroEstado('Todos'); }}
              className="text-pokeBlue font-bold text-sm hover:text-pokeRed underline"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default Animales;