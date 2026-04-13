import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function DashboardVoluntario() {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [animales, setAnimales] = useState([]);
  const [catalogo, setCatalogo] = useState([]);       // Tareas disponibles del backend
  const [ranking, setRanking] = useState([]);
  const [nivel, setNivel] = useState(1);
  const [xp, setXp] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null); // ID del animal con desplegable abierto

  const nombreUsuario = localStorage.getItem('usuarioNombre');
  const idUsuario = localStorage.getItem('usuarioId');

  // --- CARGA INICIAL ---
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // 1. Animales en el refugio
      const resAnimales = await fetch('http://localhost:3000/api/animales');
      const datosAnimales = await resAnimales.json();
      if (Array.isArray(datosAnimales)) {
        setAnimales(datosAnimales.filter(a => a.estado === 'Refugio'));
      }

      // 2. Catálogo de tareas (alimenta el desplegable)
      const resCatalogo = await fetch('http://localhost:3000/api/tareas/catalogo');
      const datosCatalogo = await resCatalogo.json();
      if (Array.isArray(datosCatalogo)) {
        setCatalogo(datosCatalogo);
      }

      // 3. Ranking
      const resRanking = await fetch('http://localhost:3000/api/ranking');
      const datosRanking = await resRanking.json();
      if (Array.isArray(datosRanking)) {
        setRanking(datosRanking);
      }

      // 4. Perfil real desde la BD (NO desde localStorage)
      if (idUsuario) {
        const resPerfil = await fetch(`http://localhost:3000/api/usuarios/${idUsuario}/perfil`);
        const datosPerfil = await resPerfil.json();
        if (datosPerfil.xp !== undefined) {
          setXp(datosPerfil.xp);
          setNivel(datosPerfil.nivel);
        }
      }

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      toast.error('Error de conexión al cargar los datos.');
    }
  };

  // --- SOLICITAR TAREA (POST al backend, sin XP directa) ---
  const solicitarTarea = async (animalId, animalNombre, tareaId, tareaNombre) => {
    if (cargando) return;
    setCargando(true);

    try {
      const respuesta = await fetch('http://localhost:3000/api/tareas/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: Number(idUsuario),
          animal_id: animalId,
          tarea_id: tareaId
        })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        toast.success(`"${tareaNombre}" con ${animalNombre} enviada. Esperando aprobación del Admin.`, {
          icon: '📋',
          duration: 5000
        });
        setAnimalSeleccionado(null); // Cerrar el desplegable
      } else {
        toast.error(datos.error || 'Error al registrar la tarea.');
      }

    } catch (error) {
      toast.error('Error de conexión al registrar la tarea.');
    } finally {
      setCargando(false);
    }
  };

  // --- CERRAR SESIÓN ---
  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioNombre');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioRol');
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  // --- CÁLCULO BARRA DE PROGRESO (fórmula exponencial) ---
  // XP necesaria para alcanzar un nivel: XP = 100 * (nivel - 1)^1.5
  const xpParaNivel = (n) => Math.floor(100 * Math.pow(n - 1, 1.5));
  const xpInicioNivelActual = xpParaNivel(nivel);
  const xpInicioSiguienteNivel = xpParaNivel(nivel + 1);
  const xpNecesariaEnEsteTramo = xpInicioSiguienteNivel - xpInicioNivelActual;
  const progresoXp = xp - xpInicioNivelActual;
  const porcentajeProgreso = xpNecesariaEnEsteTramo > 0
    ? Math.min(100, Math.floor((progresoXp / xpNecesariaEnEsteTramo) * 100))
    : 0;

  // --- RENDER ---
  return (
    <div className="max-w-7xl mx-auto">

      {/* CABECERA GAMIFICADA */}
      <div className="bg-pokeDark text-white p-4 sm:p-6 rounded-xl border-4 border-pokeYellow shadow-[4px_4px_0px_0px_#222224] mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          
          <div className="text-center lg:text-left">
            <h1 className="text-xl sm:text-3xl font-retro text-pokeLight mb-1">Diario de Voluntariado</h1>
            <p className="font-bold text-gray-300">Entrenador en turno: <span className="text-pokeYellow">{nombreUsuario}</span></p>
          </div>
          
          <div className="w-full lg:w-1/2 flex flex-col sm:flex-row items-center gap-4">
            {/* Barra de progreso */}
            <div className="w-full bg-black/30 p-3 rounded-lg border-2 border-white/20">
              <div className="flex justify-between font-bold mb-2 text-xs uppercase tracking-wider">
                <span className="text-pokeYellow">Nivel {nivel}</span>
                <span>{progresoXp} / {xpNecesariaEnEsteTramo} XP</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden border-2 border-gray-900">
                <div 
                  className="h-full bg-pokeYellow transition-all duration-1000 ease-out"
                  style={{ width: `${porcentajeProgreso}%` }}
                ></div>
              </div>
            </div>

            <button 
              onClick={handleCerrarSesion}
              className="w-full sm:w-auto bg-gray-600 text-white font-bold py-3 px-6 rounded border-2 border-gray-400 hover:bg-pokeRed hover:border-white transition-colors whitespace-nowrap"
            >
              Cerrar Sesión
            </button>
          </div>

        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: 2 columnas */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* COLUMNA IZQUIERDA: Animales con desplegable de tareas (70%) */}
        <div className="lg:w-2/3">
          <h2 className="text-2xl font-retro text-pokeDark mb-4">Animales en el Refugio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {animales.map((animal) => (
              <div key={animal.id} className="bg-white border-4 border-pokeDark rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_#222224]">
                
                {/* Cabecera de la tarjeta del animal */}
                <div className="p-4 border-b-4 border-pokeDark bg-pokeLight">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-retro text-lg text-pokeDark flex items-center gap-2">
                        {animal.imagen 
                          ? <img src={`http://localhost:3000${animal.imagen}`} alt={animal.nombre} className="w-8 h-8 object-cover rounded border-2 border-pokeDark" />
                          : <span>{animal.emoji}</span>
                        }
                        {animal.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 font-bold">{animal.especie} · {animal.edad}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded border-2 border-green-300">⚡ {animal.energia}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded border-2 border-blue-300">💙 {animal.sociabilidad}</span>
                    </div>
                  </div>
                </div>

                {/* Zona de acción */}
                <div className="p-4">
                  {/* Botón para abrir/cerrar el desplegable */}
                  <button
                    onClick={() => setAnimalSeleccionado(animalSeleccionado === animal.id ? null : animal.id)}
                    className={`w-full font-bold py-3 px-4 rounded border-4 transition-all ${
                      animalSeleccionado === animal.id
                        ? 'bg-pokeDark text-pokeYellow border-pokeYellow'
                        : 'bg-pokeBlue text-white border-pokeDark hover:bg-blue-700'
                    }`}
                  >
                    {animalSeleccionado === animal.id ? '✕ Cerrar tareas' : '📋 Registrar tarea'}
                  </button>

                  {/* Desplegable: lista de tareas del catálogo */}
                  {animalSeleccionado === animal.id && (
                    <div className="mt-3 flex flex-col gap-2 animate-pulse-once">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Selecciona una tarea:</p>
                      {catalogo.map((tarea) => (
                        <button
                          key={tarea.id}
                          disabled={cargando}
                          onClick={() => solicitarTarea(animal.id, animal.nombre, tarea.id, tarea.nombre)}
                          className="w-full text-left p-3 rounded border-2 border-gray-200 hover:border-pokeBlue hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-bold text-gray-800">{tarea.nombre}</span>
                              <span className="ml-2 text-xs text-gray-400 uppercase">({tarea.frecuencia})</span>
                            </div>
                            <span className="text-sm font-bold text-pokeBlue bg-blue-100 px-2 py-1 rounded">+{tarea.recompensa_xp} XP</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))}

            {animales.length === 0 && (
              <div className="col-span-full text-center p-8 bg-gray-50 border-4 border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-500 font-bold">No hay animales en el refugio actualmente.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Ranking (30%) */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white border-4 border-pokeDark rounded-xl p-6 shadow-[4px_4px_0px_0px_#222224]">
            <h2 className="text-xl font-retro text-pokeDark mb-4 border-b-2 border-pokeDark pb-2">Top Voluntarios</h2>
            <ul className="flex flex-col gap-3">
              {ranking?.map((usuario, index) => (
                <li key={usuario.id} className={`flex justify-between items-center p-3 rounded border-2 ${index === 0 ? 'bg-yellow-50 border-yellow-400' : index === 1 ? 'bg-gray-50 border-gray-300' : index === 2 ? 'bg-orange-50 border-orange-300' : 'border-transparent'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`font-retro text-lg ${index < 3 ? 'text-pokeDark' : 'text-gray-400'}`}>
                      #{index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{usuario.nombre}</span>
                      <span className="text-xs text-gray-500 uppercase">Nivel {usuario.nivel}</span>
                    </div>
                  </div>
                  <span className="font-bold text-pokeBlue">{usuario.xp} XP</span>
                </li>
              ))}
              {ranking.length === 0 && (
                <li className="text-sm text-gray-500 text-center py-4">No hay datos de ranking disponibles.</li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardVoluntario;