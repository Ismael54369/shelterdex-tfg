function TabInformes({ onDescargar }) {
  return (
    <div className="bg-white border-4 border-pokeDark rounded-xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#222224]">
      <div className="flex justify-between items-center mb-4 sm:mb-6 border-b-2 border-gray-200 pb-3">
        <h2 className="text-base sm:text-xl font-retro text-pokeDark">📄 Generación de Informes</h2>
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">PDF en tiempo real</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Informe de Animales */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🐾</span>
            <div>
              <h3 className="font-retro text-pokeDark">Informe de Animales</h3>
              <p className="text-sm text-gray-500 font-bold">Listado completo con estado, especie, estadísticas y datos de cada animal.</p>
            </div>
          </div>

          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Filtrar por estado:</p>
          <div className="flex flex-wrap gap-2">
            {['Todos', 'Refugio', 'Acogida', 'Adoptado'].map((filtro) => (
              <button
                key={filtro}
                onClick={() => onDescargar('animales', filtro)}
                className="bg-white font-bold text-sm py-2 px-4 rounded border-2 border-blue-300 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
              >
                📄 {filtro}
              </button>
            ))}
          </div>
        </div>

        {/* Informe de Voluntarios */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">👥</span>
            <div>
              <h3 className="font-retro text-pokeDark">Informe de Voluntarios</h3>
              <p className="text-sm text-gray-500 font-bold">Ranking por XP, niveles alcanzados y resumen de tareas realizadas por cada voluntario.</p>
            </div>
          </div>

          <button
            onClick={() => onDescargar('voluntarios')}
            className="bg-white font-bold text-sm py-2 px-4 rounded border-2 border-green-300 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors"
          >
            📄 Descargar Informe
          </button>
        </div>

      </div>

      {/* Nota informativa */}
      <div className="mt-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500 font-bold">
          Los informes se generan en tiempo real desde la base de datos y se descargan en formato PDF.
        </p>
      </div>
    </div>
  );
}

export default TabInformes;