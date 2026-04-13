import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function AdminDashboard() {
  const navigate = useNavigate();
  const [animales, setAnimales] = useState([]);
  
  // Estados para los modales
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null); // Para borrar
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false); // Para crear
  const [seccionActiva, setSeccionActiva] = useState('animales');
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [solicitudesAdopcion, setSolicitudesAdopcion] = useState([]);
  
  // NUEVOS ESTADOS PARA EDITAR
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [animalAEditar, setAnimalAEditar] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/animales')
      .then(respuesta => respuesta.json())
      .then(datos => setAnimales(datos))
      .catch(error => console.error("Error cargando animales:", error));

    cargarTareasPendientes();
    cargarEstadisticas();
    cargarSolicitudesAdopcion();
  }, []);

  const cargarSolicitudesAdopcion = () => {
    fetch('http://localhost:3000/api/adopciones/pendientes')
      .then(res => res.json())
      .then(datos => {
        if (Array.isArray(datos)) setSolicitudesAdopcion(datos);
      })
      .catch(error => console.error('Error cargando solicitudes:', error));
  };

  const revisarAdopcion = async (idSolicitud, estado, animal) => {
    try {
      const respuesta = await fetch(`http://localhost:3000/api/adopciones/revisar/${idSolicitud}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        if (estado === 'aprobada') {
          toast.success(datos.mensaje, { icon: '🏠', duration: 5000 });
          // Refrescar animales para que el estado cambie en la tabla
          fetch('http://localhost:3000/api/animales')
            .then(res => res.json())
            .then(datos => setAnimales(datos));
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
    fetch('http://localhost:3000/api/admin/estadisticas')
      .then(res => res.json())
      .then(datos => setEstadisticas(datos))
      .catch(error => console.error('Error cargando estadísticas:', error));
  };

  const cargarTareasPendientes = () => {
    fetch('http://localhost:3000/api/tareas/pendientes')
      .then(respuesta => respuesta.json())
      .then(datos => {
        if (Array.isArray(datos)) setTareasPendientes(datos);
      })
      .catch(error => console.error("Error cargando tareas pendientes:", error));
  };

  // Función para aprobar o rechazar una tarea
  const revisarTarea = async (idRegistro, estado, voluntario) => {
    try {
      const respuesta = await fetch(`http://localhost:3000/api/tareas/revisar/${idRegistro}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      await fetch(`http://localhost:3000/api/animales/${animalSeleccionado.id}`, { method: 'DELETE' });
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
      const respuesta = await fetch('http://localhost:3000/api/animales', {
        method: 'POST',
        // SIN header 'Content-Type' — el navegador lo pone automáticamente como multipart/form-data
        body: formData
      });
      const resultado = await respuesta.json();
      
      if (respuesta.ok) {
        // Recargamos la lista completa desde el servidor para tener la URL de imagen correcta
        const resAnimales = await fetch('http://localhost:3000/api/animales');
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
    
    // Añadimos los campos numéricos que el formulario básico no incluye
    formData.set('energia', animalAEditar.energia);
    formData.set('sociabilidad', animalAEditar.sociabilidad);
    formData.set('emoji', animalAEditar.emoji);
    
    // Si el animal ya tenía imagen y no se sube una nueva, mandamos la ruta existente
    if (animalAEditar.imagen && !formData.get('imagen')?.name) {
      formData.set('imagenExistente', animalAEditar.imagen);
    }

    try {
      const respuesta = await fetch(`http://localhost:3000/api/animales/${animalAEditar.id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (respuesta.ok) {
        // Recargamos desde el servidor para tener datos frescos
        const resAnimales = await fetch('http://localhost:3000/api/animales');
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

  return (
    <div className="container mx-auto p-4 max-w-6xl relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-pokeDark text-white p-6 rounded-xl border-4 border-pokeYellow shadow-[4px_4px_0px_0px_rgba(238,21,21,1)] mt-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-retro text-pokeLight mb-2">PC de Gestión (Admin)</h1>
          <p className="font-bold text-pokeYellow">
            Bienvenido, {localStorage.getItem('usuarioNombre') || 'Admin'} | Conectado a MySQL
          </p>
        </div>
        
        {/* Contenedor de botones modificado para que siempre se vea */}
        <div className="flex gap-4 mt-4 md:mt-0 w-full md:w-auto justify-center">
          <button 
            onClick={() => setModalCrearAbierto(true)} 
            className="bg-pokeRed text-white font-retro text-sm px-6 py-3 rounded border-4 border-white hover:bg-white hover:text-pokeRed transition-colors"
          >
            + Añadir Nuevo
          </button>
          
          <button 
            onClick={handleCerrarSesion} 
            className="bg-gray-500 text-white font-retro text-sm px-6 py-3 rounded border-4 border-white hover:bg-white hover:text-gray-800 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setSeccionActiva('animales')}
          className={`font-retro text-sm px-6 py-3 rounded-t border-4 transition-colors ${
            seccionActiva === 'animales'
              ? 'bg-white border-pokeDark border-b-white text-pokeDark -mb-1 z-10'
              : 'bg-gray-200 border-gray-300 text-gray-500 hover:bg-gray-100'
          }`}
        >
          🐾 Animales
        </button>
        <button
          onClick={() => setSeccionActiva('tareas')}
          className={`font-retro text-sm px-6 py-3 rounded-t border-4 transition-colors relative ${
            seccionActiva === 'tareas'
              ? 'bg-white border-pokeDark border-b-white text-pokeDark -mb-1 z-10'
              : 'bg-gray-200 border-gray-300 text-gray-500 hover:bg-gray-100'
          }`}
        >
          📋 Validar Tareas
          {tareasPendientes.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-pokeRed text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
              {tareasPendientes.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setSeccionActiva('estadisticas'); cargarEstadisticas(); }}
          className={`font-retro text-sm px-6 py-3 rounded-t border-4 transition-colors ${
            seccionActiva === 'estadisticas'
              ? 'bg-white border-pokeDark border-b-white text-pokeDark -mb-1 z-10'
              : 'bg-gray-200 border-gray-300 text-gray-500 hover:bg-gray-100'
          }`}
        >
          📊 Estadísticas
        </button>
        <button
          onClick={() => { setSeccionActiva('adopciones'); cargarSolicitudesAdopcion(); }}
          className={`font-retro text-sm px-6 py-3 rounded-t border-4 transition-colors relative ${
            seccionActiva === 'adopciones'
              ? 'bg-white border-pokeDark border-b-white text-pokeDark -mb-1 z-10'
              : 'bg-gray-200 border-gray-300 text-gray-500 hover:bg-gray-100'
          }`}
        >
          🏠 Adopciones
          {solicitudesAdopcion.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-pokeRed text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
              {solicitudesAdopcion.length}
            </span>
          )}
        </button>
      </div>

    {seccionActiva === 'animales' && (<>
      <div className="poke-card overflow-x-auto -mx-4 sm:mx-0 rounded-none sm:rounded-xl border-x-0 sm:border-x-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-pokeLight border-b-4 border-pokeDark text-pokeDark font-retro text-xs md:text-sm">
              <th className="p-4">ID</th>
              <th className="p-4">Foto</th>
              <th className="p-4">Nombre / Estado</th>
              <th className="p-4">Especie</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            {animales.map((animal) => (
              <tr key={animal.id} className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-500">#{animal.id}</td>
                <td className="p-4 text-3xl">
                  {animal.imagen 
                    ? <img src={`http://localhost:3000${animal.imagen}`} alt={animal.nombre} className="w-12 h-12 object-cover rounded-lg border-2 border-pokeDark" />
                    : animal.emoji
                  }
                </td>
                <td className="p-4">
                  <div className="text-pokeDark text-lg">{animal.nombre}</div>
                  <div className={`text-xs uppercase ${animal.estado === 'Adoptado' ? 'text-green-600' : 'text-pokeBlue'}`}>
                    {animal.estado}
                  </div>
                </td>
                <td className="p-4"><span className="bg-gray-200 px-2 py-1 rounded text-sm border-2 border-pokeDark uppercase">{animal.especie}</span></td>
                <td className="p-4 flex justify-center gap-2">
                  {/* CONECTAMOS EL BOTÓN DE EDITAR */}
                  <button 
                    onClick={() => abrirModalEditar(animal)} 
                    className="bg-pokeYellow text-pokeDark px-3 py-1 border-2 border-pokeDark rounded hover:bg-white transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button onClick={() => abrirModalBorrar(animal)} className="bg-pokeRed text-white px-3 py-1 border-2 border-pokeDark rounded hover:bg-white hover:text-pokeRed transition-colors">🗑️ Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              <div className="col-span-full">
                  <label className="block text-sm uppercase mb-1">Foto del Animal</label>
                  {animalAEditar.imagen && (
                    <div className="mb-2">
                      <img 
                        src={`http://localhost:3000${animalAEditar.imagen}`} 
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

      {/* FIN DE SECCIÓN ANIMALES */}
      </>)}

      {/* SECCIÓN: VALIDACIÓN DE TAREAS */}
      {seccionActiva === 'tareas' && (
        <div className="poke-card p-6">
          <h2 className="text-xl font-retro text-pokeDark mb-6 border-b-4 border-pokeDark pb-3">
            Bandeja de Validación
          </h2>

          {tareasPendientes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-6xl mb-4">✅</p>
              <p className="font-bold text-gray-500 text-lg">No hay tareas pendientes de revisión.</p>
              <p className="text-sm text-gray-400 mt-2">Las solicitudes de los voluntarios aparecerán aquí.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {tareasPendientes.map((tarea) => (
                <div key={tarea.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  
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
                      className="flex-1 sm:flex-none bg-green-500 text-white font-bold py-2 px-5 rounded border-4 border-green-700 hover:bg-green-600 transition-colors"
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      onClick={() => revisarTarea(tarea.id, 'rechazada', tarea.voluntario)}
                      className="flex-1 sm:flex-none bg-red-500 text-white font-bold py-2 px-5 rounded border-4 border-red-700 hover:bg-red-600 transition-colors"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="poke-card p-4 text-center">
              <p className="text-3xl font-retro text-pokeBlue">
                {estadisticas.animalesPorEstado.reduce((sum, e) => sum + e.total, 0)}
              </p>
              <p className="text-sm font-bold text-gray-500 uppercase mt-1">Animales Totales</p>
            </div>
            <div className="poke-card p-4 text-center">
              <p className="text-3xl font-retro text-pokeRed">{estadisticas.totalVoluntarios}</p>
              <p className="text-sm font-bold text-gray-500 uppercase mt-1">Voluntarios</p>
            </div>
            <div className="poke-card p-4 text-center">
              <p className="text-3xl font-retro text-green-600">
                {estadisticas.tareasPorEstado.find(t => t.estado === 'aprobada')?.total || 0}
              </p>
              <p className="text-sm font-bold text-gray-500 uppercase mt-1">Tareas Aprobadas</p>
            </div>
            <div className="poke-card p-4 text-center">
              <p className="text-3xl font-retro text-yellow-500">
                {estadisticas.tareasPorEstado.find(t => t.estado === 'pendiente')?.total || 0}
              </p>
              <p className="text-sm font-bold text-gray-500 uppercase mt-1">Pendientes</p>
            </div>
          </div>

          {/* FILA DE GRÁFICOS: Tarta + Barras */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Gráfico de Tarta: Animales por estado */}
            <div className="poke-card p-6">
              <h3 className="font-retro text-pokeDark mb-4 text-center">Animales por Estado</h3>
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
        <div className="poke-card p-6">
          <h2 className="text-xl font-retro text-pokeDark mb-6 border-b-4 border-pokeDark pb-3">
            Solicitudes de Adopción
          </h2>

          {solicitudesAdopcion.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-6xl mb-4">🏠</p>
              <p className="font-bold text-gray-500 text-lg">No hay solicitudes de adopción pendientes.</p>
              <p className="text-sm text-gray-400 mt-2">Las solicitudes del público aparecerán aquí.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {solicitudesAdopcion.map((sol) => (
                <div key={sol.id} className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                  
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
                      className="flex-1 sm:flex-none bg-green-500 text-white font-bold py-2 px-5 rounded border-4 border-green-700 hover:bg-green-600 transition-colors"
                    >
                      ✓ Aprobar Adopción
                    </button>
                    <button
                      onClick={() => revisarAdopcion(sol.id, 'rechazada', sol.animal)}
                      className="flex-1 sm:flex-none bg-red-500 text-white font-bold py-2 px-5 rounded border-4 border-red-700 hover:bg-red-600 transition-colors"
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

    </div>
  );
}

export default AdminDashboard;