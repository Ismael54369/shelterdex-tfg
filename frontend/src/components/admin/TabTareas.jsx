function TabTareas({ tareas, onRevisar }) {
  return (
    <div className="bg-white border-4 border-pokeDark rounded-xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#222224]">
      <div className="flex justify-between items-center mb-4 sm:mb-6 border-b-2 border-gray-200 pb-3">
        <h2 className="text-base sm:text-xl font-retro text-pokeDark">📋 Bandeja de Validación</h2>
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{tareas.length} pendientes</span>
      </div>

      {tareas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">✅</p>
          <p className="font-bold text-gray-500">Bandeja vacía — todo al día.</p>
          <p className="text-sm text-gray-400 mt-2">Las solicitudes de los voluntarios aparecerán aquí automáticamente.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tareas.map((tarea) => (
            <div key={tarea.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl hover:shadow-md transition-shadow">
              
              {/* Info de la tarea */}
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-lg">
                  {tarea.voluntario} <span className="text-gray-400 font-normal">solicita</span> {tarea.tarea}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  🐾 Animal: <span className="font-bold">{tarea.animal}</span> ({tarea.especie})
                  <span className="mx-2">·</span>
                  💎 Recompensa: <span className="font-bold text-pokeBlue">+{tarea.recompensa_xp} XP</span>
                  <span className="mx-2">·</span>
                  🕐 {new Date(tarea.fecha_creacion).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onRevisar(tarea.id, 'aprobada', tarea.voluntario)}
                  className="flex-1 sm:flex-none bg-green-500 text-white font-bold py-2 px-4 sm:px-5 rounded-lg border-2 border-green-600 hover:bg-green-600 hover:-translate-y-0.5 transition-all text-sm"
                >
                  ✓ Aprobar
                </button>
                <button
                  onClick={() => onRevisar(tarea.id, 'rechazada', tarea.voluntario)}
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

export default TabTareas;