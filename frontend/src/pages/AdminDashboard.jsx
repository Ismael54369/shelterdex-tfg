import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { API_URL, urlImagen } from '../config/api';

// Componente auxiliar: slider de estadística 0-100 con valor visible.
// Declarado fuera del componente padre para evitar re-crearlo en cada render
// (si se recreara, el slider perdería el foco y el estado local al teclear).
function SliderStat({ nombre, campo, valorInicial, color, icono }) {
  const [valor, setValor] = useState(Number(valorInicial) || 50);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm uppercase font-bold text-pokeDark">
          {icono} {nombre}
        </label>
        <span className="font-retro text-pokeDark text-sm">{valor}/100</span>
      </div>
      <input
        type="range"
        name={campo}
        min="0"
        max="100"
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
        className="w-full h-2 accent-pokeDark cursor-pointer"
      />
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden border-2 border-pokeDark">
        <div className={`${color} h-full transition-all`} style={{ width: `${valor}%` }}></div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  
  // Helper: cabeceras con token JWT para peticiones autenticadas
  const authHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('tokenShelterDex')}`
  });
  const authHeadersJSON = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('tokenShelterDex')}`
  });
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
      const respuesta = await fetch(`${API_URL}/api/adopciones/revisar/${idSolicitud}`, {
        method: 'PUT',
        headers: authHeadersJSON(),
        body: JSON.stringify({ estado })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        if (estado === 'aprobada') {
          toast.success(
            `Tarea aprobada. ${voluntario} ha recibido +${datos.xp_otorgada} XP (Total: ${datos.nueva_xp_total} XP, Nivel ${datos.nuevo_nivel})`,
            { icon: '✅', duration: 5000 }
          );
          // Feedback secundario: efecto sobre las stats del animal
          if (datos.stats_animal && (datos.efecto_energia !== 0 || datos.efecto_sociabilidad !== 0)) {
            const signoEnergia = datos.efecto_energia >= 0 ? '+' : '';
            const signoSoc = datos.efecto_sociabilidad >= 0 ? '+' : '';
            toast(
              `Stats del animal: ⚡${signoEnergia}${datos.efecto_energia} (ahora ${datos.stats_animal.energia}/100) · 💙${signoSoc}${datos.efecto_sociabilidad} (ahora ${datos.stats_animal.sociabilidad}/100)`,
              { icon: '📊', duration: 5000 }
            );
          }
          // Recargar también los animales para que el admin vea los cambios en la tabla
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
      toast.error('Error de conexión.');
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
                    <button onClick={() => abrirGaleria(animal)} className="bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-lg border-2 border-purple-200 hover:bg-purple-500 hover:text-white hover:border-purple-500 text-xs font-bold transition-all" title="Galería">
                      📸
                    </button>
                    <button onClick={() => abrirModalEditar(animal)} className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-lg border-2 border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 text-xs font-bold transition-all" title="Editar">
                      ✏️
                    </button>
                    <button onClick={() => abrirModalBorrar(animal)} className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-lg border-2 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 text-xs font-bold transition-all" title="Borrar">
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
      {modalCrearAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="poke-card p-6 bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b-4 border-pokeDark pb-4">
              <h2 className="text-2xl font-retro text-pokeRed">Registrar Animal</h2>
              <button onClick={() => setModalCrearAbierto(false)} className="text-3xl font-bold text-gray-500 hover:text-pokeRed">&times;</button>
            </div>
            <form onSubmit={handleCrearAnimal} className="space-y-4 font-bold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm uppercase mb-1">Nombre</label><input type="text" name="nombre" required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" /></div>
                <div>
                  <label className="block text-sm uppercase mb-1">Especie</label>
                  <select name="especie" className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight">
                    <option value="Perro">Perro</option><option value="Gato">Gato</option><option value="Otro">Otro</option>
                  </select>
                </div>
                <div><label className="block text-sm uppercase mb-1">Edad</label><input type="text" name="edad" required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" /></div>
                <div><label className="block text-sm uppercase mb-1">Peso</label><input type="text" name="peso" required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" /></div>
                <div><label className="block text-sm uppercase mb-1">Emoji</label><input type="text" name="emoji" defaultValue="🐾" maxLength="2" className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight text-center text-xl" /></div>
              </div>

              {/* Estadísticas iniciales (Opción C: admin las ajusta al alta) */}
              <div className="bg-pokeLight border-4 border-pokeDark rounded-lg p-4 space-y-4">
                <p className="text-xs uppercase text-pokeDark font-bold">Estadísticas iniciales</p>
                <SliderStat nombre="Energía" campo="energia" valorInicial={50} color="bg-pokeYellow" icono="⚡" />
                <SliderStat nombre="Sociabilidad" campo="sociabilidad" valorInicial={50} color="bg-pokeBlue" icono="💙" />
              </div>
              <div className="col-span-full">
                  <label className="block text-sm uppercase mb-1">Foto del Animal</label>
                  <input 
                    type="file" 
                    name="imagen" 
                    accept="image/jpeg,image/png,image/webp"
                    className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight file:mr-4 file:py-1 file:px-4 file:rounded file:border-2 file:border-pokeDark file:bg-pokeYellow file:font-bold file:text-pokeDark hover:file:bg-yellow-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG o WebP. Máximo 5MB. (Opcional)</p>
              </div>
              <div><label className="block text-sm uppercase mb-1">Descripción</label><textarea name="descripcion" rows="3" required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight"></textarea></div>
              <button type="submit" className="w-full bg-pokeYellow text-pokeDark font-retro py-4 rounded border-4 border-pokeDark hover:bg-white hover:-translate-y-1 transition-all">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {/* NUEVO MODAL EDITAR (Se pre-rellena usando defaultValue) */}
      {modalEditarAbierto && animalAEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="poke-card p-6 bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b-4 border-pokeDark pb-4">
              <h2 className="text-2xl font-retro text-pokeBlue">Editar Ficha: {animalAEditar.nombre}</h2>
              <button onClick={() => setModalEditarAbierto(false)} className="text-3xl font-bold text-gray-500 hover:text-pokeRed">&times;</button>
            </div>
            
            <form onSubmit={handleEditarAnimal} className="space-y-4 font-bold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm uppercase mb-1">Nombre</label>
                  <input type="text" name="nombre" defaultValue={animalAEditar.nombre} required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" />
                </div>
                <div>
                  <label className="block text-sm uppercase mb-1">Estado</label>
                  <select name="estado" defaultValue={animalAEditar.estado} className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight">
                    <option value="Refugio">Refugio</option>
                    <option value="Acogida">Acogida</option>
                    <option value="Adoptado">Adoptado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm uppercase mb-1">Especie</label>
                  <select name="especie" defaultValue={animalAEditar.especie} className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight">
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm uppercase mb-1">Edad</label>
                  <input type="text" name="edad" defaultValue={animalAEditar.edad} required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" />
                </div>
                <div>
                  <label className="block text-sm uppercase mb-1">Peso</label>
                  <input type="text" name="peso" defaultValue={animalAEditar.peso} required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" />
                </div>
              </div>

              {/* Estadísticas editables (Opción C: el admin puede ajustar manualmente) */}
              <div className="bg-pokeLight border-4 border-pokeDark rounded-lg p-4 space-y-4">
                <p className="text-xs uppercase text-pokeDark font-bold">Estadísticas del animal</p>
                <SliderStat nombre="Energía" campo="energia" valorInicial={animalAEditar.energia} color="bg-pokeYellow" icono="⚡" />
                <SliderStat nombre="Sociabilidad" campo="sociabilidad" valorInicial={animalAEditar.sociabilidad} color="bg-pokeBlue" icono="💙" />
                <p className="text-xs text-gray-500 italic">
                  ℹ️ Estas estadísticas también se modifican automáticamente cuando un voluntario completa una tarea aprobada.
                </p>
              </div>
              <div className="col-span-full">
                  <label className="block text-sm uppercase mb-1">Foto del Animal</label>
                  {animalAEditar.imagen && (
                    <div className="mb-2">
                      <img 
                        src={urlImagen(animalAEditar.imagen)} 
                        alt={animalAEditar.nombre}
                        className="w-24 h-24 object-cover rounded border-4 border-pokeDark"
                      />
                      <p className="text-xs text-gray-500 mt-1">Foto actual. Sube una nueva para reemplazarla.</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    name="imagen" 
                    accept="image/jpeg,image/png,image/webp"
                    className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight file:mr-4 file:py-1 file:px-4 file:rounded file:border-2 file:border-pokeDark file:bg-pokeYellow file:font-bold file:text-pokeDark hover:file:bg-yellow-300"
                  />
              </div>
              <div>
                <label className="block text-sm uppercase mb-1">Descripción</label>
                <textarea name="descripcion" defaultValue={animalAEditar.descripcion} rows="3" required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight"></textarea>
              </div>

              <button type="submit" className="w-full bg-pokeBlue text-white font-retro py-4 rounded border-4 border-pokeDark hover:bg-white hover:text-pokeBlue hover:-translate-y-1 transition-all">
                Actualizar Ficha
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GALERÍA DE IMÁGENES */}
      {modalGaleriaAbierto && animalGaleria && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="poke-card p-4 sm:p-6 bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6 border-b-4 border-pokeDark pb-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-retro text-purple-600">Galería: {animalGaleria.nombre}</h2>
                <p className="text-sm text-gray-500 font-bold">{imagenesGaleria.length} foto(s)</p>
              </div>
              <button onClick={() => setModalGaleriaAbierto(false)} className="text-3xl font-bold text-gray-500 hover:text-pokeRed">&times;</button>
            </div>

            {/* Subir imágenes */}
            <div className="mb-6 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <label className="block text-sm font-bold uppercase text-purple-700 mb-2">Subir nuevas fotos (máx. 5 a la vez)</label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={subirImagenes}
                disabled={subiendoImagenes}
                className="w-full p-2 border-4 border-pokeDark rounded bg-white font-bold text-sm file:mr-4 file:py-1 file:px-4 file:rounded file:border-2 file:border-pokeDark file:bg-pokeYellow file:font-bold file:text-pokeDark hover:file:bg-yellow-300 disabled:opacity-50"
              />
              {subiendoImagenes && <p className="text-sm text-purple-600 font-bold mt-2">Subiendo...</p>}
            </div>

            {/* Grid de imágenes */}
            {imagenesGaleria.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📷</p>
                <p className="text-gray-500 font-bold">Este animal aún no tiene fotos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imagenesGaleria.map((img) => (
                  <div key={img.id} className={`relative group rounded-lg overflow-hidden border-4 ${img.es_portada ? 'border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'border-gray-300'}`}>
                    <img
                      src={urlImagen(img.ruta)}
                      alt={`Foto de ${animalGaleria.nombre}`}
                      className="w-full h-32 sm:h-40 object-cover"
                    />
                    
                    {/* Badge de portada */}
                    {img.es_portada && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-pokeDark text-xs font-bold px-2 py-1 rounded border-2 border-pokeDark">
                        ⭐ Portada
                      </span>
                    )}

                    {/* Botones de acción (aparecen al hacer hover) */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!img.es_portada && (
                        <button
                          onClick={() => establecerPortada(img.id)}
                          className="bg-yellow-400 text-pokeDark font-bold text-xs px-3 py-2 rounded border-2 border-pokeDark hover:bg-yellow-300"
                        >
                          ⭐ Portada
                        </button>
                      )}
                      <button
                        onClick={() => borrarImagen(img.id)}
                        className="bg-red-500 text-white font-bold text-xs px-3 py-2 rounded border-2 border-red-700 hover:bg-red-600"
                      >
                        🗑️ Borrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* FIN DE SECCIÓN ANIMALES */}
      </>)}

      {/* SECCIÓN: VALIDACIÓN DE TAREAS */}
      {seccionActiva === 'tareas' && (
        <div className="bg-white border-4 border-pokeDark rounded-xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#222224]">
          <div className="flex justify-between items-center mb-4 sm:mb-6 border-b-2 border-gray-200 pb-3">
            <h2 className="text-base sm:text-xl font-retro text-pokeDark">📋 Bandeja de Validación</h2>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{tareasPendientes.length} pendientes</span>
          </div>

          {tareasPendientes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">✅</p>
              <p className="font-bold text-gray-500">Bandeja vacía — todo al día.</p>
              <p className="text-sm text-gray-400 mt-2">Las solicitudes de los voluntarios aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {tareasPendientes.map((tarea) => (
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
                      onClick={() => revisarTarea(tarea.id, 'aprobada', tarea.voluntario)}
                      className="flex-1 sm:flex-none bg-green-500 text-white font-bold py-2 px-4 sm:px-5 rounded-lg border-2 border-green-600 hover:bg-green-600 hover:-translate-y-0.5 transition-all text-sm"
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      onClick={() => revisarTarea(tarea.id, 'rechazada', tarea.voluntario)}
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
      )}
      
      {/* SECCIÓN: ESTADÍSTICAS */}
      {seccionActiva === 'estadisticas' && estadisticas && (
        <div className="flex flex-col gap-6">

          {/* TARJETAS KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Animales</p>
              <p className="text-xl sm:text-3xl font-retro text-pokeBlue">
                {estadisticas.animalesPorEstado.reduce((sum, e) => sum + e.total, 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-red-200 hover:border-red-400 transition-colors">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Voluntarios</p>
              <p className="text-xl sm:text-3xl font-retro text-pokeRed">{estadisticas.totalVoluntarios}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-green-200 hover:border-green-400 transition-colors">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Aprobadas</p>
              <p className="text-xl sm:text-3xl font-retro text-green-600">
                {estadisticas.tareasPorEstado.find(t => t.estado === 'aprobada')?.total || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-yellow-200 hover:border-yellow-400 transition-colors">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pendientes</p>
              <p className="text-xl sm:text-3xl font-retro text-yellow-500">
                {estadisticas.tareasPorEstado.find(t => t.estado === 'pendiente')?.total || 0}
              </p>
            </div>
          </div>

          {/* FILA DE GRÁFICOS: Tarta + Barras */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Gráfico de Tarta: Animales por estado */}
            <div className="poke-card p-3 sm:p-6">
              <h3 className="font-retro text-sm sm:text-base text-pokeDark mb-4 text-center">Animales por Estado</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={estadisticas.animalesPorEstado.map(e => ({ name: e.estado, value: e.total }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    strokeWidth={3}
                    stroke="#222224"
                  >
                    {estadisticas.animalesPorEstado.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={['#3B82F6', '#F59E0B', '#10B981'][index % 3]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Barras: Ranking de Voluntarios */}
            <div className="poke-card p-6">
              <h3 className="font-retro text-pokeDark mb-4 text-center">Ranking de Voluntarios (XP)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={estadisticas.rankingVoluntarios} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="nombre" width={120} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                  <Tooltip 
                    formatter={(value) => [`${value} XP`, 'Experiencia']}
                  />
                  <Bar dataKey="xp" radius={[0, 8, 8, 0]} strokeWidth={2} stroke="#222224">
                    {estadisticas.rankingVoluntarios.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={index === 0 ? '#EE1515' : index === 1 ? '#3B82F6' : '#9CA3AF'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Barras: Tareas más populares (ancho completo) */}
          <div className="poke-card p-6">
            <h3 className="font-retro text-pokeDark mb-4 text-center">Tareas Más Solicitadas</h3>
            {estadisticas.tareasPopulares.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={estadisticas.tareasPopulares}>
                  <XAxis dataKey="nombre" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} veces`, 'Solicitudes']} />
                  <Bar dataKey="total" fill="#3B82F6" radius={[8, 8, 0, 0]} strokeWidth={2} stroke="#222224" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 font-bold py-8">Aún no hay tareas registradas.</p>
            )}
          </div>

        </div>
      )}

      {/* SECCIÓN: SOLICITUDES DE ADOPCIÓN */}
      {seccionActiva === 'adopciones' && (
        <div className="bg-white border-4 border-pokeDark rounded-xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#222224]">
          <div className="flex justify-between items-center mb-4 sm:mb-6 border-b-2 border-gray-200 pb-3">
            <h2 className="text-base sm:text-xl font-retro text-pokeDark">🏠 Solicitudes de Adopción</h2>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{solicitudesAdopcion.length} pendientes</span>
          </div>

          {solicitudesAdopcion.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-6xl mb-4">🏠</p>
              <p className="font-bold text-gray-500 text-lg">No hay solicitudes de adopción pendientes.</p>
              <p className="text-sm text-gray-400 mt-2">Las solicitudes del público aparecerán aquí.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {solicitudesAdopcion.map((sol) => (
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
                      onClick={() => revisarAdopcion(sol.id, 'aprobada', sol.animal)}
                      className="flex-1 sm:flex-none bg-green-500 text-white font-bold py-2 px-4 sm:px-5 rounded-lg border-2 border-green-600 hover:bg-green-600 hover:-translate-y-0.5 transition-all text-sm"
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      onClick={() => revisarAdopcion(sol.id, 'rechazada', sol.animal)}
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
      )}

      {/* SECCIÓN: INFORMES PDF */}
      {seccionActiva === 'informes' && (
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
                    onClick={() => descargarInforme('animales', filtro)}
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
                onClick={() => descargarInforme('voluntarios')}
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
      )}

    </div>
  );
}

export default AdminDashboard;