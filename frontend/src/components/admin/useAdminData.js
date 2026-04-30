import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import { authHeaders, authHeadersJSON } from './adminHelpers';

export default function useAdminData() {
  const navigate = useNavigate();

  const [animales, setAnimales] = useState([]);
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
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
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [animalAEditar, setAnimalAEditar] = useState(null);

  // --- CARGA INICIAL ---
  useEffect(() => {
    fetch(`${API_URL}/api/animales`)
      .then(respuesta => respuesta.json())
      .then(datos => setAnimales(datos))
      .catch(error => console.error("Error cargando animales:", error));

    cargarTareasPendientes();
    cargarEstadisticas();
    cargarSolicitudesAdopcion();
  }, []);

  // --- HELPER: recargar lista de animales ---
  const recargarAnimales = async () => {
    const res = await fetch(`${API_URL}/api/animales`);
    if (res.ok) setAnimales(await res.json());
  };

  // --- ADOPCIONES ---
  const cargarSolicitudesAdopcion = () => {
    fetch(`${API_URL}/api/adopciones/pendientes`, { headers: authHeaders() })
      .then(res => res.json())
      .then(datos => { if (Array.isArray(datos)) setSolicitudesAdopcion(datos); })
      .catch(error => console.error('Error cargando solicitudes:', error));
  };

  const revisarAdopcion = async (idSolicitud, estado, animal) => {
    try {
      const controlador = new AbortController();
      const timeout = setTimeout(() => controlador.abort(), 15000);

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
          await recargarAnimales();
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

  // --- ESTADÍSTICAS ---
  const cargarEstadisticas = () => {
    fetch(`${API_URL}/api/admin/estadisticas`, { headers: authHeaders() })
      .then(res => res.json())
      .then(datos => setEstadisticas(datos))
      .catch(error => console.error('Error cargando estadísticas:', error));
  };

  // --- GALERÍA ---
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
        await recargarAnimales();
      } else {
        toast.error(datos.error || 'Error al subir imágenes.');
      }
    } catch (error) {
      toast.error('Error de conexión al subir imágenes.');
    } finally {
      setSubiendoImagenes(false);
      e.target.value = '';
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
        await recargarAnimales();
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
        await recargarAnimales();
      }
    } catch (error) {
      toast.error('Error al borrar la imagen.');
    }
  };

  // --- INFORMES ---
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

  // --- TAREAS ---
  const cargarTareasPendientes = () => {
    fetch(`${API_URL}/api/tareas/pendientes`, { headers: authHeaders() })
      .then(respuesta => respuesta.json())
      .then(datos => { if (Array.isArray(datos)) setTareasPendientes(datos); })
      .catch(error => console.error("Error cargando tareas pendientes:", error));
  };

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
        cargarTareasPendientes();
      } else {
        toast.error(datos.error || 'Error al revisar la tarea.');
      }
    } catch (error) {
      toast.error('Error de conexión al revisar la tarea.');
    }
  };

  // --- CRUD ANIMALES ---
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

  const handleCrearAnimal = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const respuesta = await fetch(`${API_URL}/api/animales`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      });

      if (respuesta.ok) {
        await recargarAnimales();
        toast.success(`¡${formData.get('nombre')} añadido!`, { icon: '✨' });
        setModalCrearAbierto(false);
      }
    } catch (error) {
      toast.error('Error al guardar.');
    }
  };

  const abrirModalEditar = (animal) => {
    setAnimalAEditar(animal);
    setModalEditarAbierto(true);
  };

  const handleEditarAnimal = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.set('emoji', animalAEditar.emoji);

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
        await recargarAnimales();
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

  // --- FILTROS ---
  const animalesFiltrados = animales.filter(animal => {
    const coincideBusqueda = animal.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                              animal.especie.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'Todos' || animal.estado === filtroEstado;
    const coincideEspecie = filtroEspecie === 'Todos' || animal.especie === filtroEspecie;
    return coincideBusqueda && coincideEstado && coincideEspecie;
  });

  const cerrarGaleria = () => setModalGaleriaAbierto(false);
  const cerrarEditar = () => setModalEditarAbierto(false);

  return {
    // Estado
    animales, animalesFiltrados, animalSeleccionado,
    modalCrearAbierto, setModalCrearAbierto,
    modalEditarAbierto, animalAEditar,
    modalGaleriaAbierto, animalGaleria, imagenesGaleria, subiendoImagenes,
    seccionActiva, setSeccionActiva,
    busqueda, setBusqueda,
    filtroEstado, setFiltroEstado,
    filtroEspecie, setFiltroEspecie,
    tareasPendientes, estadisticas, solicitudesAdopcion,
    // Acciones
    cargarEstadisticas, cargarSolicitudesAdopcion,
    revisarAdopcion, revisarTarea,
    abrirGaleria, subirImagenes, establecerPortada, borrarImagen,
    descargarInforme,
    abrirModalBorrar, cancelarBorrado, confirmarBorrado,
    handleCrearAnimal, abrirModalEditar, handleEditarAnimal,
    handleCerrarSesion, cerrarGaleria, cerrarEditar,
  };
}