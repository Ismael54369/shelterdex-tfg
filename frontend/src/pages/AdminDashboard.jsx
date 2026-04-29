import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { authHeaders, authHeadersJSON } from '../components/admin/adminHelpers';
import SliderStat from '../components/admin/SliderStat';
import ModalCrear from '../components/admin/ModalCrear';
import ModalEditar from '../components/admin/ModalEditar';
import ModalGaleria from '../components/admin/ModalGaleria';
import TabTareas from '../components/admin/TabTareas';
import TabAdopciones from '../components/admin/TabAdopciones';
import TabEstadisticas from '../components/admin/TabEstadisticas';
import TabInformes from '../components/admin/TabInformes';
import TabAnimales from '../components/admin/TabAnimales';

function AdminDashboard() {
  const navigate = useNavigate();
  
  const [animales, setAnimales] = useState([]);
  
  // Estados para los modales
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null); // Para borrar
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false); // Para crear
  const [seccionActiva, setSeccionActiva] = useState('animales');
  const [modalGaleriaAbierto, setModalGaleriaAbierto] = useState(false);
  const [animalGaleria, setAnimalGaleria] = useState(null);
  const [imagenesGaleria, setImagenesGaleria] = useState([]);
  const [subiendoImagenes, setSubiendoImagenes] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroEspecie, setFiltroEspecie] = useState('Todos');
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [solicitudesAdopcion, setSolicitudesAdopcion] = useState([]);
  
  // NUEVOS ESTADOS PARA EDITAR
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [animalAEditar, setAnimalAEditar] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/animales`)
      .then(respuesta => respuesta.json())
      .then(datos => setAnimales(datos))
      .catch(error => console.error("Error cargando animales:", error));

    cargarTareasPendientes();
    cargarEstadisticas();
    cargarSolicitudesAdopcion();
  }, []);

  const cargarSolicitudesAdopcion = () => {
fetch(`${API_URL}/api/adopciones/pendientes`, { headers: authHeaders() })      .then(res => res.json())
      .then(datos => {
        if (Array.isArray(datos)) setSolicitudesAdopcion(datos);
      })
      .catch(error => console.error('Error cargando solicitudes:', error));
  };

  const revisarAdopcion = async (idSolicitud, estado, animal) => {
    try {
      const controlador = new AbortController();
      const timeout = setTimeout(() => controlador.abort(), 15000); // 15s de margen

      const respuesta = await fetch(`${API_URL}/api/adopciones/revisar/${idSolicitud}`, {
        method: 'PUT',
        headers: authHeadersJSON(),
        body: JSON.stringify({ estado }),
        signal: controlador.signal
      });

      clearTimeout(timeout);
      const datos = await respuesta.json();

      if (respuesta.ok) {
        if (estado === 'aprobada') {
          toast.success(datos.mensaje || 'Adopción aprobada.', { icon: '✅', duration: 5000 });
          // Recargar animales para reflejar el cambio de estado
          const resAnimales = await fetch(`${API_URL}/api/animales`);
          if (resAnimales.ok) {
            setAnimales(await resAnimales.json());
          }
        } else {
          toast('Solicitud rechazada.', { icon: '❌' });
        }
        cargarSolicitudesAdopcion();
        cargarEstadisticas();
      } else {
        toast.error(datos.error || 'Error al revisar la solicitud.');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast('La operación tardó más de lo esperado. Recarga la página para ver el estado actual.', { icon: '⏳', duration: 6000 });
      } else {
        toast.error('Error de conexión al servidor.');
      }
    }
  };

  const cargarEstadisticas = () => {
fetch(`${API_URL}/api/admin/estadisticas`, { headers: authHeaders() })      .then(res => res.json())
      .then(datos => setEstadisticas(datos))
      .catch(error => console.error('Error cargando estadísticas:', error));
  };

  // --- FUNCIONES DE GALERÍA ---
  const abrirGaleria = async (animal) => {
    setAnimalGaleria(animal);
    setModalGaleriaAbierto(true);
    await cargarImagenesGaleria(animal.id);
  };

  const cargarImagenesGaleria = async (animalId) => {
    try {
      const res = await fetch(`${API_URL}/api/animales/${animalId}/imagenes`);
      const datos = await res.json();
      if (Array.isArray(datos)) setImagenesGaleria(datos);
    } catch (error) {
      console.error('Error cargando galería:', error);
    }
  };

  const subirImagenes = async (e) => {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;
    setSubiendoImagenes(true);

    const formData = new FormData();
    for (let i = 0; i < archivos.length; i++) {
      formData.append('imagenes', archivos[i]);
    }

    try {
      const res = await fetch(`${API_URL}/api/animales/${animalGaleria.id}/imagenes`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      });
      const datos = await res.json();

      if (res.ok) {
        toast.success(datos.mensaje, { icon: '📸' });
        await cargarImagenesGaleria(animalGaleria.id);
        // Refrescar lista de animales para que se actualice la portada
        const resAnimales = await fetch(`${API_URL}/api/animales`);
        const datosAnimales = await resAnimales.json();
        setAnimales(datosAnimales);
      } else {
        toast.error(datos.error || 'Error al subir imágenes.');
      }
    } catch (error) {
      toast.error('Error de conexión al subir imágenes.');
    } finally {
      setSubiendoImagenes(false);
      e.target.value = ''; // Limpiar el input para poder subir de nuevo
    }
  };

  const establecerPortada = async (idImagen) => {
    try {
      const res = await fetch(`${API_URL}/api/imagenes/${idImagen}/portada`, {
        method: 'PUT',
        headers: authHeaders()
      });

      if (res.ok) {
        toast.success('Portada actualizada.', { icon: '⭐' });
        await cargarImagenesGaleria(animalGaleria.id);
        const resAnimales = await fetch(`${API_URL}/api/animales`);
        const datosAnimales = await resAnimales.json();
        setAnimales(datosAnimales);
      }
    } catch (error) {
      toast.error('Error al cambiar la portada.');
    }
  };

  const borrarImagen = async (idImagen) => {
    if (!confirm('¿Seguro que quieres borrar esta imagen?')) return;

    try {
      const res = await fetch(`${API_URL}/api/imagenes/${idImagen}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (res.ok) {
        toast.success('Imagen eliminada.', { icon: '🗑️' });
        await cargarImagenesGaleria(animalGaleria.id);
        const resAnimales = await fetch(`${API_URL}/api/animales`);
        const datosAnimales = await resAnimales.json();
        setAnimales(datosAnimales);
      }
    } catch (error) {
      toast.error('Error al borrar la imagen.');
    }
  };

  const descargarInforme = async (tipo, filtro = 'Todos') => {
    try {
      const url = tipo === 'animales'
        ? `${API_URL}/api/informes/animales?estado=${filtro}`
        : `${API_URL}/api/informes/voluntarios`;

      const respuesta = await fetch(url, { headers: authHeaders() });

      if (!respuesta.ok) {
        toast.error('Error al generar el informe.');
        return;
      }

      // Convertir la respuesta en un archivo descargable
      const blob = await respuesta.blob();
      const urlArchivo = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = urlArchivo;
      enlace.download = tipo === 'animales'
        ? `informe_animales_${filtro.toLowerCase()}.pdf`
        : 'informe_voluntarios.pdf';
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(urlArchivo);

      toast.success('Informe descargado correctamente.', { icon: '📄' });

    } catch (error) {
      toast.error('Error de conexión al generar el informe.');
    }
  };

  const cargarTareasPendientes = () => {
fetch(`${API_URL}/api/tareas/pendientes`, { headers: authHeaders() })      .then(respuesta => respuesta.json())
      .then(datos => {
        if (Array.isArray(datos)) setTareasPendientes(datos);
      })
      .catch(error => console.error("Error cargando tareas pendientes:", error));
  };

  // Función para aprobar o rechazar una tarea
  const revisarTarea = async (idRegistro, estado, voluntario) => {
    try {
      const respuesta = await fetch(`${API_URL}/api/tareas/revisar/${idRegistro}`, {
        method: 'PUT',
        headers: authHeadersJSON(),
        body: JSON.stringify({ estado })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        if (estado === 'aprobada') {
          toast.success(`Tarea aprobada. ${voluntario} ha recibido +${datos.xp_otorgada} XP (Total: ${datos.nueva_xp_total} XP, Nivel ${datos.nuevo_nivel})`, {
            icon: '✅',
            duration: 5000
          });
        } else {
          toast('Tarea rechazada. No se asignó XP.', { icon: '❌' });
        }
        // Refrescar la lista eliminando la tarea procesada
        cargarTareasPendientes();
      } else {
        toast.error(datos.error || 'Error al revisar la tarea.');
      }
    } catch (error) {
      toast.error('Error de conexión al revisar la tarea.');
    }
  };

  // -- LÓGICA DE BORRAR --
  const abrirModalBorrar = (animal) => setAnimalSeleccionado(animal);
  const cancelarBorrado = () => setAnimalSeleccionado(null);
  
  const confirmarBorrado = async () => {
    try {
      await fetch(`${API_URL}/api/animales/${animalSeleccionado.id}`, { method: 'DELETE', headers: authHeaders() });      
      setAnimales(animales.filter(a => a.id !== animalSeleccionado.id));
      toast.success(`${animalSeleccionado.nombre} eliminado.`, { icon: '🗑️' });
      setAnimalSeleccionado(null);
    } catch (error) {
      toast.error('Error al borrar.');
    }
  };

  // -- LÓGICA DE CREAR --
  const handleCrearAnimal = async (e) => {
    e.preventDefault();
    // Ya no convertimos a JSON — enviamos FormData directamente para que Multer reciba el archivo
    const formData = new FormData(e.target);

    try {
      const respuesta = await fetch(`${API_URL}/api/animales`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      });
      const resultado = await respuesta.json();
      
      if (respuesta.ok) {
        // Recargamos la lista completa desde el servidor para tener la URL de imagen correcta
        const resAnimales = await fetch(`${API_URL}/api/animales`);
        const datosAnimales = await resAnimales.json();
        setAnimales(datosAnimales);
        
        toast.success(`¡${formData.get('nombre')} añadido!`, { icon: '✨' });
        setModalCrearAbierto(false);
      }
    } catch (error) {
      toast.error('Error al guardar.');
    }
  };

  // -- NUEVA LÓGICA DE EDITAR --
  const abrirModalEditar = (animal) => {
    setAnimalAEditar(animal);
    setModalEditarAbierto(true);
  };

  const handleEditarAnimal = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Emoji se mantiene (no se edita en este formulario)
    formData.set('emoji', animalAEditar.emoji);
    
    // Si el animal ya tenía imagen y no se sube una nueva, mandamos la ruta existente
    if (animalAEditar.imagen && !formData.get('imagen')?.name) {
      formData.set('imagenExistente', animalAEditar.imagen);
    }

    try {
      const respuesta = await fetch(`${API_URL}/api/animales/${animalAEditar.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: formData
      });
      
      if (respuesta.ok) {
        // Recargamos desde el servidor para tener datos frescos
        const resAnimales = await fetch(`${API_URL}/api/animales`);
        const datosAnimales = await resAnimales.json();
        setAnimales(datosAnimales);
        
        toast.success(`Ficha de ${formData.get('nombre')} actualizada`, { icon: '📝' });
        setModalEditarAbierto(false);
      }
    } catch (error) {
      toast.error('Error al actualizar.');
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('tokenShelterDex');
    localStorage.removeItem('usuarioNombre');
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  // Filtrar animales según búsqueda y filtros
  const animalesFiltrados = animales.filter(animal => {
    const coincideBusqueda = animal.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                              animal.especie.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'Todos' || animal.estado === filtroEstado;
    const coincideEspecie = filtroEspecie === 'Todos' || animal.especie === filtroEspecie;
    return coincideBusqueda && coincideEstado && coincideEspecie;
  });

  return (
    <div className="container mx-auto p-4 max-w-6xl relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 sm:mb-8 bg-pokeDark text-white p-4 sm:p-6 rounded-xl border-4 border-pokeYellow shadow-[4px_4px_0px_0px_rgba(238,21,21,1)] mt-4 sm:mt-6">
        <div>
          <p className="text-xs font-bold text-pokeYellow/60 uppercase tracking-wider">Panel de Administración</p>
          <h1 className="text-xl sm:text-3xl font-retro text-pokeLight">ShelterDex Admin</h1>
          <p className="font-bold text-gray-400 text-sm mt-1">
            👋 {localStorage.getItem('usuarioNombre') || 'Admin'} · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        
        {/* Contenedor de botones modificado para que siempre se vea */}
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

      {/* PESTAÑAS DE NAVEGACIÓN */}
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

      {/* MODAL CREAR */}
      <ModalCrear
        abierto={modalCrearAbierto}
        onCerrar={() => setModalCrearAbierto(false)}
        onCrear={handleCrearAnimal}
      />

      {/* MODAL EDITAR */}
      <ModalEditar
        abierto={modalEditarAbierto}
        animal={animalAEditar}
        onCerrar={() => setModalEditarAbierto(false)}
        onEditar={handleEditarAnimal}
      />

      {/* MODAL GALERÍA */}
      <ModalGaleria
        abierto={modalGaleriaAbierto}
        animal={animalGaleria}
        imagenes={imagenesGaleria}
        onCerrar={() => setModalGaleriaAbierto(false)}
        onSubir={subirImagenes}
        onEstablecerPortada={establecerPortada}
        onBorrar={borrarImagen}
        subiendo={subiendoImagenes}
      />

      {/* FIN DE SECCIÓN ANIMALES */}
      </>)}

      {/* SECCIÓN: VALIDACIÓN DE TAREAS */}
      {seccionActiva === 'tareas' && (
        <TabTareas tareas={tareasPendientes} onRevisar={revisarTarea} />
      )}
      
      {/* SECCIÓN: ESTADÍSTICAS */}
      {seccionActiva === 'estadisticas' && (
        <TabEstadisticas estadisticas={estadisticas} />
      )}

      {/* SECCIÓN: SOLICITUDES DE ADOPCIÓN */}
      {seccionActiva === 'adopciones' && (
        <TabAdopciones solicitudes={solicitudesAdopcion} onRevisar={revisarAdopcion} />
      )}

      {/* SECCIÓN: INFORMES PDF */}
      {seccionActiva === 'informes' && (
        <TabInformes onDescargar={descargarInforme} />
      )}

    </div>
  );
}

export default AdminDashboard;