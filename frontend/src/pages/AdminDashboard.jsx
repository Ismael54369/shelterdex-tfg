import ModalCrear from '../components/admin/ModalCrear';
import ModalEditar from '../components/admin/ModalEditar';
import ModalGaleria from '../components/admin/ModalGaleria';
import TabTareas from '../components/admin/TabTareas';
import TabAdopciones from '../components/admin/TabAdopciones';
import TabEstadisticas from '../components/admin/TabEstadisticas';
import TabInformes from '../components/admin/TabInformes';
import TabAnimales from '../components/admin/TabAnimales';
import useAdminData from '../components/admin/useAdminData';

function AdminDashboard() {
  const {
    animales, animalesFiltrados, animalSeleccionado,
    modalCrearAbierto, setModalCrearAbierto,
    modalEditarAbierto, animalAEditar,
    modalGaleriaAbierto, animalGaleria, imagenesGaleria, subiendoImagenes,
    seccionActiva, setSeccionActiva,
    busqueda, setBusqueda,
    filtroEstado, setFiltroEstado,
    filtroEspecie, setFiltroEspecie,
    tareasPendientes, estadisticas, solicitudesAdopcion,
    cargarEstadisticas, cargarSolicitudesAdopcion,
    revisarAdopcion, revisarTarea,
    abrirGaleria, subirImagenes, establecerPortada, borrarImagen,
    descargarInforme,
    abrirModalBorrar, cancelarBorrado, confirmarBorrado,
    handleCrearAnimal, abrirModalEditar, handleEditarAnimal,
    handleCerrarSesion, cerrarGaleria, cerrarEditar,
  } = useAdminData();

  return (
    <div className="container mx-auto p-4 max-w-6xl relative">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 sm:mb-8 bg-pokeDark text-white p-4 sm:p-6 rounded-xl border-4 border-pokeYellow shadow-[4px_4px_0px_0px_rgba(238,21,21,1)] mt-4 sm:mt-6">
        <div>
          <p className="text-xs font-bold text-pokeYellow/60 uppercase tracking-wider">Panel de Administración</p>
          <h1 className="text-xl sm:text-3xl font-retro text-pokeLight">ShelterDex Admin</h1>
          <p className="font-bold text-gray-400 text-sm mt-1">
            👋 {localStorage.getItem('usuarioNombre') || 'Admin'} · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 mt-4 md:mt-0 w-full md:w-auto justify-center">
          <button 
            onClick={() => setModalCrearAbierto(true)} 
            className="bg-green-500 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-3 rounded-lg border-2 border-green-400 hover:bg-green-400 hover:-translate-y-0.5 hover:shadow-lg transition-all flex-1 md:flex-none flex items-center justify-center gap-1"
          >
            <span>+</span> <span className="hidden sm:inline">Añadir</span> <span className="sm:hidden">Nuevo</span>
          </button>
          <button 
            onClick={handleCerrarSesion} 
            className="bg-white/10 text-white/70 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-3 rounded-lg border-2 border-white/20 hover:bg-white hover:text-pokeDark transition-all flex-1 md:flex-none"
          >
            Salir
          </button>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="flex gap-1 sm:gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'animales', icono: '🐾', texto: 'Animales', badge: 0 },
          { id: 'tareas', icono: '📋', texto: 'Validar', badge: tareasPendientes.length },
          { id: 'estadisticas', icono: '📊', texto: 'Stats', badge: 0 },
          { id: 'adopciones', icono: '🏠', texto: 'Adopciones', badge: solicitudesAdopcion.length },
          { id: 'informes', icono: '📄', texto: 'Informes', badge: 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={(e) => {
              setSeccionActiva(tab.id);
              if (tab.id === 'estadisticas') cargarEstadisticas();
              if (tab.id === 'adopciones') cargarSolicitudesAdopcion();
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }}
            className={`font-bold text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-3 rounded-lg whitespace-nowrap transition-all relative flex-shrink-0 flex items-center gap-1 sm:gap-2 ${
              seccionActiva === tab.id
                ? 'bg-pokeDark text-white shadow-[3px_3px_0px_0px_#222224]'
                : 'bg-white text-gray-500 border-2 border-gray-200 hover:border-pokeDark hover:text-pokeDark'
            }`}
          >
            <span>{tab.icono}</span>
            <span className="hidden sm:inline">{tab.texto}</span>
            {tab.badge > 0 && (
              <span className="bg-pokeRed text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ml-1">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SECCIÓN: ANIMALES */}
      {seccionActiva === 'animales' && (<>
        <TabAnimales
          animales={animales}
          animalesFiltrados={animalesFiltrados}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
          filtroEspecie={filtroEspecie}
          setFiltroEspecie={setFiltroEspecie}
          onGaleria={abrirGaleria}
          onEditar={abrirModalEditar}
          onBorrar={abrirModalBorrar}
        />

        {/* MODAL BORRAR */}
        {animalSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="poke-card p-8 bg-white max-w-md w-full text-center animate-bounce-short">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-retro text-pokeRed mb-4">¡Cuidado!</h2>
              <p className="font-bold text-gray-700 text-lg mb-8">¿Seguro que quieres borrar a {animalSeleccionado.nombre}?</p>
              <div className="flex gap-4 justify-center">
                <button onClick={cancelarBorrado} className="flex-1 bg-gray-300 font-retro py-3 rounded border-4 border-pokeDark">Cancelar</button>
                <button onClick={confirmarBorrado} className="flex-1 bg-pokeRed text-white font-retro py-3 rounded border-4 border-pokeDark">Borrar</button>
              </div>
            </div>
          </div>
        )}

        <ModalCrear abierto={modalCrearAbierto} onCerrar={() => setModalCrearAbierto(false)} onCrear={handleCrearAnimal} />
        <ModalEditar abierto={modalEditarAbierto} animal={animalAEditar} onCerrar={cerrarEditar} onEditar={handleEditarAnimal} />
        <ModalGaleria abierto={modalGaleriaAbierto} animal={animalGaleria} imagenes={imagenesGaleria} onCerrar={cerrarGaleria} onSubir={subirImagenes} onEstablecerPortada={establecerPortada} onBorrar={borrarImagen} subiendo={subiendoImagenes} />
      </>)}

      {/* SECCIÓN: TAREAS */}
      {seccionActiva === 'tareas' && (
        <TabTareas tareas={tareasPendientes} onRevisar={revisarTarea} />
      )}

      {/* SECCIÓN: ESTADÍSTICAS */}
      {seccionActiva === 'estadisticas' && (
        <TabEstadisticas estadisticas={estadisticas} />
      )}

      {/* SECCIÓN: ADOPCIONES */}
      {seccionActiva === 'adopciones' && (
        <TabAdopciones solicitudes={solicitudesAdopcion} onRevisar={revisarAdopcion} />
      )}

      {/* SECCIÓN: INFORMES */}
      {seccionActiva === 'informes' && (
        <TabInformes onDescargar={descargarInforme} />
      )}
    </div>
  );
}

export default AdminDashboard;