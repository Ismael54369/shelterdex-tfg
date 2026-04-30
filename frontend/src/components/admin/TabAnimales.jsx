import { urlImagen } from '../../config/api';

function TabAnimales({ animales, animalesFiltrados, busqueda, setBusqueda, filtroEstado, setFiltroEstado, filtroEspecie, setFiltroEspecie, onAbrir, onEditar, onBorrar, onGaleria }) {
  return (
    <>
      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Campo de búsqueda */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar por nombre o especie..."
            className="w-full p-2 sm:p-3 border-4 border-pokeDark rounded-lg bg-white font-bold text-sm focus:outline-none focus:border-pokeBlue"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pokeRed font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtro por estado */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="p-2 sm:p-3 border-4 border-pokeDark rounded-lg bg-white font-bold text-sm focus:outline-none focus:border-pokeBlue"
        >
          <option value="Todos">Estado: Todos</option>
          <option value="Refugio">Refugio</option>
          <option value="Acogida">Acogida</option>
          <option value="Adoptado">Adoptado</option>
        </select>

        {/* Filtro por especie */}
        <select
          value={filtroEspecie}
          onChange={(e) => setFiltroEspecie(e.target.value)}
          className="p-2 sm:p-3 border-4 border-pokeDark rounded-lg bg-white font-bold text-sm focus:outline-none focus:border-pokeBlue"
        >
          <option value="Todos">Especie: Todos</option>
          <option value="Perro">Perro</option>
          <option value="Gato">Gato</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      {/* Contador de resultados */}
      <p className="text-xs font-bold text-gray-400 mb-2">
        Mostrando {animalesFiltrados.length} de {animales.length} animales
      </p>

      <div className="poke-card overflow-x-auto -mx-4 sm:mx-0 rounded-none sm:rounded-xl border-x-0 sm:border-x-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-pokeDark text-white font-retro text-xs">
              <th className="p-3 sm:p-4">ID</th>
              <th className="p-3 sm:p-4">Foto</th>
              <th className="p-3 sm:p-4">Nombre / Estado</th>
              <th className="p-3 sm:p-4">Especie</th>
              <th className="p-3 sm:p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            {animalesFiltrados.map((animal) => (
              <tr key={animal.id} className="border-b-2 border-gray-200 hover:bg-pokeYellow/10 transition-colors group">
                <td className="p-3 sm:p-4 text-gray-400 font-retro text-xs">#{animal.id}</td>
                <td className="p-3 sm:p-4">
                  {animal.imagen 
                    ? <img src={urlImagen(animal.imagen)} alt={animal.nombre} className="w-10 h-10 sm:w-14 sm:h-14 object-cover rounded-lg border-2 border-pokeDark group-hover:border-pokeYellow transition-colors" />
                    : <span className="text-2xl sm:text-3xl">{animal.emoji}</span>
                  }
                </td>
                <td className="p-4">
                  <div className="text-pokeDark text-lg">{animal.nombre}</div>
                  <div className={`text-xs uppercase ${animal.estado === 'Adoptado' ? 'text-green-600' : 'text-pokeBlue'}`}>
                    {animal.estado}
                  </div>
                </td>
                <td className="p-4"><span className="bg-gray-200 px-2 py-1 rounded text-sm border-2 border-pokeDark uppercase">{animal.especie}</span></td>
                <td className="p-3 sm:p-4">
                  <div className="flex justify-center gap-1 sm:gap-2">
                    <button onClick={() => onGaleria(animal)} className="bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-lg border-2 border-purple-200 hover:bg-purple-500 hover:text-white hover:border-purple-500 text-xs font-bold transition-all" title="Galería">
                      📸
                    </button>
                    <button onClick={() => onEditar(animal)} className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-lg border-2 border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 text-xs font-bold transition-all" title="Editar">
                      ✏️
                    </button>
                    <button onClick={() => onBorrar(animal)} className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-lg border-2 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 text-xs font-bold transition-all" title="Borrar">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {animalesFiltrados.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 font-bold">No se encontraron animales con esos filtros.</p>
                <button
                  onClick={() => { setBusqueda(''); setFiltroEstado('Todos'); setFiltroEspecie('Todos'); }}
                  className="mt-2 text-pokeBlue font-bold text-sm hover:text-pokeRed underline"
                >
                  Limpiar filtros
                </button>
              </div>
          )}
      </div>
    </>
  );
}

export default TabAnimales;