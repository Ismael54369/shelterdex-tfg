import { Link } from 'react-router-dom';

// Datos falsos simulando la base de datos
const animalesDB = [
  { id: 1, nombre: 'Rex', especie: 'Perro', estado: 'Refugio', emoji: '🐶' },
  { id: 2, nombre: 'Luna', especie: 'Gato', estado: 'Acogida', emoji: '🐱' },
  { id: 3, nombre: 'Toby', especie: 'Perro', estado: 'Adoptado', emoji: '🐕' },
];

function AdminDashboard() {
  
  // Funciones simuladas para los botones del CRUD
  const handleBorrar = (nombre) => {
    if(window.confirm(`¿Estás seguro de que quieres dar de baja a ${nombre}?`)) {
      alert(`${nombre} ha sido eliminado de la base de datos (Simulado).`);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      
      {/* Cabecera del Panel */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-pokeDark text-white p-6 rounded-xl border-4 border-pokeYellow shadow-[4px_4px_0px_0px_rgba(238,21,21,1)]">
        <div>
          <h1 className="text-3xl font-retro text-pokeLight mb-2">PC de Gestión (Admin)</h1>
          <p className="font-bold text-pokeYellow">Sistema de almacenamiento y registro.</p>
        </div>
        <button className="mt-4 md:mt-0 bg-pokeRed text-white font-retro text-sm px-6 py-3 rounded border-4 border-white hover:bg-white hover:text-pokeRed transition-colors">
          + Añadir Nuevo
        </button>
      </div>

      {/* Tabla de Datos (El Read del CRUD) */}
      <div className="poke-card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-pokeLight border-b-4 border-pokeDark text-pokeDark font-retro text-xs md:text-sm">
              <th className="p-4">ID</th>
              <th className="p-4">Foto</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Especie</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            {animalesDB.map((animal) => (
              <tr key={animal.id} className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-500">#{animal.id}</td>
                <td className="p-4 text-3xl">{animal.emoji}</td>
                <td className="p-4 text-pokeDark text-lg">{animal.nombre}</td>
                <td className="p-4"><span className="bg-gray-200 px-2 py-1 rounded text-sm border-2 border-pokeDark uppercase">{animal.especie}</span></td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm text-white border-2 border-pokeDark ${animal.estado === 'Adoptado' ? 'bg-green-500' : 'bg-pokeBlue'}`}>
                    {animal.estado}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  {/* Botón Editar (Update) */}
                  <button className="bg-pokeYellow text-pokeDark px-3 py-1 border-2 border-pokeDark rounded hover:bg-white transition-colors">
                    ✏️ Editar
                  </button>
                  {/* Botón Borrar (Delete) */}
                  <button 
                    onClick={() => handleBorrar(animal.nombre)}
                    className="bg-pokeRed text-white px-3 py-1 border-2 border-pokeDark rounded hover:bg-white hover:text-pokeRed transition-colors"
                  >
                    🗑️ Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default AdminDashboard;