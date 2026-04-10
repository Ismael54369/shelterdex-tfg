import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function DashboardVoluntario() {
    
    const navigate = useNavigate();
  const [animales, setAnimales] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [nivel, setNivel] = useState(1);
  const [xp, setXp] = useState(0);
  const [cargando, setCargando] = useState(false);

  const nombreUsuario = localStorage.getItem('usuarioNombre');
  const idUsuario = localStorage.getItem('usuarioId');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    // 1. Cargar animales con validación de tipo
    fetch('http://localhost:3000/api/animales')
      .then(res => res.json())
      .then(datos => {
        if (Array.isArray(datos)) {
          setAnimales(datos.filter(a => a.estado === 'Refugio'));
        } else {
          console.error('Error de formato en animales:', datos);
          setAnimales([]); // Forzamos un array vacío para evitar el crasheo
        }
      })
      .catch(err => {
        console.error('Error de red cargando animales:', err);
        setAnimales([]);
      });

    // 2. Cargar ranking con validación de tipo
    fetch('http://localhost:3000/api/ranking')
      .then(res => res.json())
      .then(datos => {
        if (Array.isArray(datos)) {
          setRanking(datos);
        } else {
          console.error('Error de formato en ranking:', datos);
          setRanking([]); // Forzamos un array vacío
        }
      })
      .catch(err => {
        console.error('Error de red cargando ranking:', err);
        setRanking([]);
      });

    // Cargar progreso del LocalStorage
    const xpLocal = localStorage.getItem('usuarioXp') || 0;
    const nivelLocal = localStorage.getItem('usuarioNivel') || 1;
    setXp(Number(xpLocal));
    setNivel(Number(nivelLocal));
  };

  const registrarAccion = async (animal, accion, puntos) => {
    if (cargando) return;
    setCargando(true);

    try {
      const respuesta = await fetch(`http://localhost:3000/api/usuarios/${idUsuario}/xp`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puntosAgregados: puntos })
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        
        setXp(datos.xp);
        setNivel(datos.nivel);
        localStorage.setItem('usuarioXp', datos.xp);
        localStorage.setItem('usuarioNivel', datos.nivel);

        toast.success(`Acción registrada: ${accion} a ${animal.nombre} (+${puntos} XP)`);

        if (datos.subidaNivel) {
          toast.success(`NUEVO NIVEL ALCANZADO: Nivel ${datos.nivel}`);
        }

        // Refrescar el ranking por si el usuario ha subido de posición
        cargarDatos();
      }
    } catch (error) {
      toast.error('Error de conexión al registrar la acción.');
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('tokenShelterDex');
    localStorage.removeItem('usuarioNombre');
    localStorage.removeItem('usuarioRol');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioXp');
    localStorage.removeItem('usuarioNivel');
    
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  // ==========================================
  // CÁLCULO DE PROGRESO EXPONENCIAL
  // ==========================================
  // Fórmula de XP Total requerida para llegar a un nivel: 100 * (Nivel - 1)^1.5
  const calcularXpDeNivel = (n) => Math.floor(100 * Math.pow(n - 1, 1.5));

  const xpBaseNivelActual = calcularXpDeNivel(nivel);
  const xpBaseProximoNivel = calcularXpDeNivel(nivel + 1);
  
  // XP necesaria solo para este tramo (ej: del nivel 2 al 3)
  const xpNecesariaEnEsteTramo = xpBaseProximoNivel - xpBaseNivelActual;
  
  // Cuánta XP llevamos conseguida dentro de este tramo
  const progresoXp = xp - xpBaseNivelActual;
  
  // Porcentaje final para la barra visual (con límite máx del 100%)
  const porcentajeProgreso = Math.min((progresoXp / xpNecesariaEnEsteTramo) * 100, 100);

  return (
    <div className="container mx-auto p-4 max-w-7xl mt-6">
      
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* COLUMNA IZQUIERDA: Área de Trabajo (70%) */}
        <div className="lg:w-2/3">
          <h1 className="text-3xl font-retro text-pokeDark mb-6 border-b-4 border-pokeDark pb-2">Panel de Operaciones</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {animales?.map((animal) => (
              <div key={animal.id} className="bg-white border-4 border-pokeDark rounded-xl p-5 shadow-[4px_4px_0px_0px_#222224] flex flex-col">
                <div className="flex justify-between items-center mb-3 border-b-2 border-gray-100 pb-2">
                  <h3 className="text-xl font-bold text-pokeDark">{animal.nombre}</h3>
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {animal.especie}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-6 flex-grow">{animal.descripcion}</p>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => registrarAccion(animal, 'Paseo', 20)}
                    className="w-full bg-green-100 text-green-800 font-bold py-2 px-4 rounded border-2 border-green-800 hover:bg-green-800 hover:text-white transition-colors flex justify-between items-center"
                  >
                    <span>Asignar Paseo</span> <span className="text-sm bg-white/50 px-2 rounded">+20 XP</span>
                  </button>
                  <button 
                    onClick={() => registrarAccion(animal, 'Alimentación', 10)}
                    className="w-full bg-blue-100 text-blue-800 font-bold py-2 px-4 rounded border-2 border-blue-800 hover:bg-blue-800 hover:text-white transition-colors flex justify-between items-center"
                  >
                    <span>Asignar Alimentación</span> <span className="text-sm bg-white/50 px-2 rounded">+10 XP</span>
                  </button>
                </div>
              </div>
            ))}

            {animales.length === 0 && (
              <div className="col-span-full text-center p-8 bg-gray-50 border-4 border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-500 font-bold">Sin tareas pendientes en el refugio.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Gamificación y Estadísticas (30%) */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          
          {/* Tarjeta de Perfil */}
          {/* Cabecera Gamificada con botón de salida */}
      <div className="bg-pokeDark text-white p-6 rounded-xl border-4 border-pokeYellow shadow-[4px_4px_0px_0px_#222224] mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-retro text-pokeLight mb-1">Diario de Voluntariado</h1>
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

            {/* Botón de cerrar sesión */}
            <button 
              onClick={handleCerrarSesion}
              className="w-full sm:w-auto bg-gray-600 text-white font-bold py-3 px-6 rounded border-2 border-gray-400 hover:bg-pokeRed hover:border-white transition-colors whitespace-nowrap"
            >
              Cerrar Sesión
            </button>
          </div>

        </div>
      </div>

          {/* Leaderboard */}
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