import { useState } from 'react';

// Datos falsos de las tareas pendientes
const tareasPendientes = [
  { id: 1, animal: 'Rex', tipo: 'Paseo largo', recompensa: 50, emoji: '🐶' },
  { id: 2, animal: 'Luna', tipo: 'Cepillado', recompensa: 30, emoji: '🐱' },
  { id: 3, animal: 'Toby', tipo: 'Entrenamiento', recompensa: 100, emoji: '🐕' },
];

function Dashboard() {
  // Estado para controlar el Nivel y la Experiencia (XP)
  const [nivel, setNivel] = useState(3);
  const [xp, setXp] = useState(150);
  const xpNecesaria = 300; // XP necesaria para subir al nivel 4

  // Función que se ejecuta al pulsar el botón de una tarea
  const completarTarea = (recompensa, animal) => {
    let nuevaXp = xp + recompensa;
    
    // Si la XP supera la necesaria, subimos de nivel
    if (nuevaXp >= xpNecesaria) {
      setNivel(nivel + 1);
      setXp(nuevaXp - xpNecesaria); // Guardamos el sobrante para el siguiente nivel
      alert(`¡Súper efectivo! Has ayudado a ${animal} y has SUBIDO DE NIVEL.`);
    } else {
      setXp(nuevaXp);
    }
  };

  // Calculamos el porcentaje para la barra visual (ej. 150/300 = 50%)
  const porcentajeXp = (xp / xpNecesaria) * 100;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      
      {/* TARJETA DE ENTRENADOR (Perfil del voluntario) */}
      <div className="poke-card p-6 bg-pokeBlue text-white mb-8 mt-4 relative overflow-hidden">
        <h1 className="text-2xl font-retro text-pokeYellow mb-4 drop-shadow-[2px_2px_0px_#222224]">
          Tarjeta de Voluntario
        </h1>
        
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-24 h-24 bg-white border-4 border-pokeDark rounded-full flex items-center justify-center text-5xl shadow-[inset_3px_3px_0px_rgba(0,0,0,0.2)]">
            👦🏻
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-xl font-bold">Ash Ketchum (Nivel {nivel})</h2>
              <span className="font-retro text-sm">{xp} / {xpNecesaria} XP</span>
            </div>
            
            {/* Barra de Experiencia */}
            <div className="w-full bg-pokeDark rounded-full h-6 border-4 border-white p-1">
              <div 
                className="bg-pokeYellow h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${porcentajeXp}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-retro text-pokeDark mb-6 border-b-4 border-pokeDark pb-2">
        Misiones Diarias
      </h2>

      {/* GRID DE TAREAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tareasPendientes.map((tarea) => (
          <div key={tarea.id} className="poke-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-3xl">{tarea.emoji}</span>
                <span className="bg-pokeYellow text-pokeDark font-retro text-xs px-2 py-1 rounded border-2 border-pokeDark">
                  +{tarea.recompensa} XP
                </span>
              </div>
              <h3 className="text-xl font-bold text-pokeDark">{tarea.animal}</h3>
              <p className="text-gray-600 font-semibold mb-4">{tarea.tipo}</p>
            </div>
            
            <button 
              onClick={() => completarTarea(tarea.recompensa, tarea.animal)}
              className="w-full bg-pokeRed text-white font-retro text-xs py-3 rounded border-4 border-pokeDark hover:bg-white hover:text-pokeRed transition-colors"
            >
              Completar Misión
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Dashboard;