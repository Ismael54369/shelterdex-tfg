import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { API_URL, urlImagen } from '../config/api';

function DashboardVoluntario() {
  const navigate = useNavigate();
  const [animales, setAnimales] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [nivel, setNivel] = useState(1);
  const [xp, setXp] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const nombreUsuario = localStorage.getItem('usuarioNombre');
  const idUsuario = localStorage.getItem('usuarioId');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [resAnimales, resCatalogo, resRanking] = await Promise.all([
        fetch(`${API_URL}/api/animales`),
        fetch(`${API_URL}/api/tareas/catalogo`),
        fetch(`${API_URL}/api/ranking`)
      ]);

      const datosAnimales = await resAnimales.json();
      const datosCatalogo = await resCatalogo.json();
      const datosRanking = await resRanking.json();

      if (Array.isArray(datosAnimales)) setAnimales(datosAnimales.filter(a => a.estado === 'Refugio'));
      if (Array.isArray(datosCatalogo)) setCatalogo(datosCatalogo);
      if (Array.isArray(datosRanking)) setRanking(datosRanking);

      if (idUsuario) {
        const resPerfil = await fetch(`${API_URL}/api/usuarios/${idUsuario}/perfil`);
        const datosPerfil = await resPerfil.json();
        if (datosPerfil.xp !== undefined) { setXp(datosPerfil.xp); setNivel(datosPerfil.nivel); }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error de conexión al cargar los datos.');
    }
  };

  const cargarHistorial = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tareas/historial/${idUsuario}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tokenShelterDex')}` }
      });
      const datos = await res.json();
      if (Array.isArray(datos)) setHistorial(datos);
    } catch (error) { console.error('Error al cargar historial:', error); }
  };

  const toggleHistorial = () => {
    if (!mostrarHistorial) cargarHistorial();
    setMostrarHistorial(!mostrarHistorial);
  };

  const solicitarTarea = async (animalId, animalNombre, tareaId, tareaNombre) => {
    if (cargando) return;
    setCargando(true);
    try {
      const respuesta = await fetch(`${API_URL}/api/tareas/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('tokenShelterDex')}` },
        body: JSON.stringify({ usuario_id: Number(idUsuario), animal_id: animalId, tarea_id: tareaId })
      });
      const datos = await respuesta.json();
      if (respuesta.ok) {
        toast.success(`"${tareaNombre}" con ${animalNombre} enviada. Esperando aprobación.`, { icon: '📋', duration: 5000 });
        setAnimalSeleccionado(null);
      } else { toast.error(datos.error || 'Error al registrar la tarea.'); }
    } catch (error) { toast.error('Error de conexión.'); }
    finally { setCargando(false); }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('tokenShelterDex');
    localStorage.removeItem('usuarioNombre');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioRol');
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  // Fórmula exponencial de progreso
  const xpParaNivel = (n) => Math.floor(100 * Math.pow(n - 1, 1.5));
  const xpInicioNivelActual = xpParaNivel(nivel);
  const xpInicioSiguienteNivel = xpParaNivel(nivel + 1);
  const xpNecesariaEnEsteTramo = xpInicioSiguienteNivel - xpInicioNivelActual;
  const progresoXp = xp - xpInicioNivelActual;
  const porcentajeProgreso = xpNecesariaEnEsteTramo > 0 ? Math.min(100, Math.floor((progresoXp / xpNecesariaEnEsteTramo) * 100)) : 0;

  // Mensaje motivacional según nivel
  const getMensaje = () => {
    if (nivel >= 5) return '🏆 ¡Eres una leyenda del refugio!';
    if (nivel >= 3) return '🔥 ¡Gran trabajo, sigue así!';
    if (nivel >= 2) return '⭐ ¡Vas por buen camino!';
    return '🌱 ¡Bienvenido, cada tarea cuenta!';
  };

  const medallas = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-7xl mx-auto">

      {/* CABECERA */}
      <div className="bg-pokeDark text-white p-4 sm:p-6 rounded-xl border-4 border-pokeYellow shadow-[4px_4px_0px_0px_#222224] mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="text-center lg:text-left">
            <p className="text-xs sm:text-sm font-bold text-pokeYellow/70 uppercase tracking-wider">{getMensaje()}</p>
            <h1 className="text-xl sm:text-3xl font-retro text-pokeLight mt-1">{nombreUsuario}</h1>
            <p className="font-bold text-gray-400 text-sm">Nivel {nivel} · {xp} XP totales</p>
          </div>
          
          <div className="w-full lg:w-1/2 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full bg-black/30 p-3 rounded-lg border-2 border-white/20">
              <div className="flex justify-between font-bold mb-2 text-xs uppercase tracking-wider">
                <span className="text-pokeYellow">Nivel {nivel}</span>
                <span>{progresoXp} / {xpNecesariaEnEsteTramo} XP</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden border-2 border-gray-900">
                <div className="h-full bg-pokeYellow transition-all duration-1000 ease-out" style={{ width: `${porcentajeProgreso}%` }}></div>
              </div>
            </div>
            <button onClick={handleCerrarSesion} className="w-full sm:w-auto bg-gray-600 text-white font-bold py-2 px-4 sm:px-5 rounded-lg border-2 border-gray-500 hover:bg-pokeRed hover:border-pokeRed transition-colors text-xs sm:text-sm">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO: 2 columnas */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* COLUMNA IZQUIERDA: Animales (70%) */}
        <div className="lg:w-2/3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-2xl font-retro text-pokeDark">Animales en el Refugio</h2>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{animales.length} disponibles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {animales.map((animal) => (
              <div key={animal.id} className="bg-white border-4 border-pokeDark rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_#222224]">
                
                {/* Cabecera con foto */}
                <div className="p-3 sm:p-4 border-b-4 border-pokeDark bg-pokeLight">
                  <div className="flex items-center gap-3">
                    {animal.imagen 
                      ? <img src={urlImagen(animal.imagen)} alt={animal.nombre} className="w-12 h-12 object-cover rounded-lg border-2 border-pokeDark flex-shrink-0" />
                      : <span className="text-3xl flex-shrink-0">{animal.emoji}</span>
                    }
                    <div className="flex-1 min-w-0">
                      <h3 className="font-retro text-base sm:text-lg text-pokeDark truncate">{animal.nombre}</h3>
                      <p className="text-xs text-gray-500 font-bold">{animal.especie} · ⚡{animal.energia} · 💙{animal.sociabilidad}</p>
                    </div>
                  </div>
                </div>

                {/* Zona de acción */}
                <div className="p-3 sm:p-4">
                  <button
                    onClick={() => setAnimalSeleccionado(animalSeleccionado === animal.id ? null : animal.id)}
                    className={`w-full font-bold py-2 sm:py-2.5 px-4 rounded-lg border-4 transition-all text-xs sm:text-sm ${
                      animalSeleccionado === animal.id
                        ? 'bg-pokeDark text-pokeYellow border-pokeYellow'
                        : 'bg-pokeBlue text-white border-pokeDark hover:bg-blue-700'
                    }`}
                  >
                    {animalSeleccionado === animal.id ? 'Cerrar' : 'Registrar tarea'}
                  </button>

                  {animalSeleccionado === animal.id && (
                    <div className="mt-3 flex flex-col gap-1 sm:gap-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Selecciona una tarea:</p>
                      {catalogo.map((tarea) => (
                        <button
                          key={tarea.id}
                          disabled={cargando}
                          onClick={() => solicitarTarea(animal.id, animal.nombre, tarea.id, tarea.nombre)}
                          className="w-full text-left p-2 sm:p-3 rounded-lg border-2 border-gray-200 hover:border-pokeBlue hover:bg-blue-50 transition-colors disabled:opacity-50"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-bold text-gray-800 text-sm">{tarea.nombre}</span>
                              <span className="ml-1 text-xs text-gray-400">({tarea.frecuencia})</span>
                            </div>
                            <span className="text-xs font-bold text-pokeBlue bg-blue-100 px-2 py-1 rounded">+{tarea.recompensa_xp} XP</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {animales.length === 0 && (
              <div className="col-span-full text-center py-12 bg-gray-50 border-4 border-dashed border-gray-300 rounded-xl">
                <p className="text-4xl mb-2">🏠</p>
                <p className="text-gray-500 font-bold">No hay animales en el refugio actualmente.</p>
              </div>
            )}
          </div>

          {/* Botón de historial */}
          <button onClick={toggleHistorial} className={`w-full font-bold py-2.5 px-4 rounded-lg border-4 transition-all mt-6 text-xs sm:text-sm ${mostrarHistorial ? 'bg-pokeDark text-pokeYellow border-pokeYellow' : 'bg-white text-pokeDark border-pokeDark hover:bg-pokeDark hover:text-white'}`}>
            {mostrarHistorial ? 'Cerrar historial' : 'Ver mi historial de tareas'}
          </button>

          {mostrarHistorial && (
            <div className="mt-4 bg-white border-4 border-pokeDark rounded-xl p-4 shadow-[4px_4px_0px_0px_#222224]">
              <h3 className="font-retro text-pokeDark text-sm mb-4 border-b-2 border-pokeDark pb-2">Mis Últimas Tareas</h3>
              {historial.length === 0 ? (
                <p className="text-center text-gray-500 font-bold py-6 text-sm">Aún no has registrado ninguna tarea.</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                  {historial.map((tarea) => (
                    <div key={tarea.id} className={`p-3 rounded-lg border-2 ${tarea.estado === 'aprobada' ? 'bg-green-50 border-green-300' : tarea.estado === 'rechazada' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">{tarea.emoji} {tarea.tarea} → {tarea.animal}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(tarea.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${tarea.estado === 'aprobada' ? 'bg-green-200 text-green-800' : tarea.estado === 'rechazada' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                            {tarea.estado === 'aprobada' ? '✓ Aprobada' : tarea.estado === 'rechazada' ? '✕ Rechazada' : '⏳ Pendiente'}
                          </span>
                          <span className="text-xs font-bold text-gray-400">+{tarea.recompensa_xp} XP</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Ranking (30%) */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white border-4 border-pokeDark rounded-xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#222224]">
            <h2 className="text-base sm:text-xl font-retro text-pokeDark mb-4 border-b-2 border-pokeDark pb-2">Top Voluntarios</h2>
            <ul className="flex flex-col gap-2 sm:gap-3">
              {ranking?.map((usuario, index) => (
                <li key={usuario.id} className={`flex justify-between items-center p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                  index === 0 ? 'bg-yellow-50 border-yellow-400' : 
                  index === 1 ? 'bg-gray-50 border-gray-300' : 
                  index === 2 ? 'bg-orange-50 border-orange-300' : 
                  'border-transparent hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">{index < 3 ? medallas[index] : <span className="font-retro text-gray-400 text-sm">#{index + 1}</span>}</span>
                    <div>
                      <span className="font-bold text-gray-800 text-sm">{usuario.nombre}</span>
                      <p className="text-xs text-gray-500">Nivel {usuario.nivel}</p>
                    </div>
                  </div>
                  <span className="font-bold text-pokeBlue text-sm">{usuario.xp} XP</span>
                </li>
              ))}
              {ranking.length === 0 && (
                <li className="text-sm text-gray-500 text-center py-4">No hay datos de ranking disponibles.</li>
              )}
            </ul>
          </div>

          {/* Resumen rápido */}
          <div className="bg-pokeDark text-white rounded-xl p-4 sm:p-5 border-4 border-pokeDark shadow-[4px_4px_0px_0px_#222224]">
            <h3 className="font-retro text-pokeYellow text-sm mb-3">Tu Resumen</h3>
            <div className="space-y-2 text-sm font-bold">
              <div className="flex justify-between">
                <span className="text-gray-400">Nivel actual</span>
                <span className="text-pokeYellow">{nivel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">XP total</span>
                <span className="text-white">{xp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Siguiente nivel</span>
                <span className="text-white">{xpNecesariaEnEsteTramo - progresoXp} XP restantes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Posición ranking</span>
                <span className="text-white">
                  {ranking.findIndex(u => u.id === Number(idUsuario)) !== -1 
                    ? `#${ranking.findIndex(u => u.id === Number(idUsuario)) + 1} de ${ranking.length}`
                    : 'Sin ranking'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardVoluntario;