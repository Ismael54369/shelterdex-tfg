function TabAdopciones({ solicitudes, onRevisar }) {
  return (
    <div className="bg-white border-4 border-pokeDark rounded-xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#222224]">
      <div className="flex justify-between items-center mb-4 sm:mb-6 border-b-2 border-gray-200 pb-3">
        <h2 className="text-base sm:text-xl font-retro text-pokeDark">🏠 Solicitudes de Adopción</h2>
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{solicitudes.length} pendientes</span>
      </div>

      {solicitudes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-6xl mb-4">🏠</p>
          <p className="font-bold text-gray-500 text-lg">No hay solicitudes de adopción pendientes.</p>
          <p className="text-sm text-gray-400 mt-2">Las solicitudes del público aparecerán aquí.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {solicitudes.map((sol) => (
            <div key={sol.id} className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              
              {/* Cabecera */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    {sol.nombre_solicitante} <span className="text-gray-400 font-normal">quiere adoptar a</span> {sol.emoji} {sol.animal}
                  </p>
                  <p className="text-sm text-gray-500">
                    {sol.especie}
                    <span className="mx-2">·</span>
                    🕐 {new Date(sol.fecha_creacion).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Datos de contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 bg-white p-3 rounded border-2 border-orange-200 text-sm font-bold">
                <p>📧 {sol.email}</p>
                <p>📱 {sol.telefono}</p>
                {sol.mensaje && <p className="sm:col-span-3 text-gray-600 font-normal italic">"{sol.mensaje}"</p>}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <button
                  onClick={() => onRevisar(sol.id, 'aprobada', sol.animal)}
                  className="flex-1 sm:flex-none bg-green-500 text-white font-bold py-2 px-4 sm:px-5 rounded-lg border-2 border-green-600 hover:bg-green-600 hover:-translate-y-0.5 transition-all text-sm"
                >
                  ✓ Aprobar
                </button>
                <button
                  onClick={() => onRevisar(sol.id, 'rechazada', sol.animal)}
                  className="flex-1 sm:flex-none bg-white text-red-500 font-bold py-2 px-4 sm:px-5 rounded-lg border-2 border-red-300 hover:bg-red-500 hover:text-white hover:-translate-y-0.5 transition-all text-sm"
                >
                  ✕ Rechazar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TabAdopciones;