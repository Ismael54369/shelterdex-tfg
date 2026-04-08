import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

function AdminDashboard() {
  // Ahora el estado inicial está vacío, porque los datos vendrán del servidor
  const [animales, setAnimales] = useState([]);
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);

  // 1. USE EFFECT: Se ejecuta al cargar la página para pedir los datos a tu Backend
  useEffect(() => {
    fetch('http://localhost:3000/api/animales')
      .then(respuesta => respuesta.json())
      .then(datos => {
        setAnimales(datos); // Guardamos los datos reales de MySQL en React
      })
      .catch(error => console.error("Error cargando la base de datos:", error));
  }, []);

  const abrirModalBorrar = (animal) => {
    setAnimalSeleccionado(animal);
  };

  const cancelarBorrado = () => {
    setAnimalSeleccionado(null);
  };

  // 2. CONFIRMAR BORRADO: Ahora borra de verdad en la base de datos
  const confirmarBorrado = async () => {
    try {
      // Le decimos al backend que borre este ID
      await fetch(`http://localhost:3000/api/animales/${animalSeleccionado.id}`, {
        method: 'DELETE',
      });

      // Si todo va bien, lo quitamos de la pantalla
      const nuevaLista = animales.filter(a => a.id !== animalSeleccionado.id);
      setAnimales(nuevaLista);
      
      toast.success(`${animalSeleccionado.nombre} ha sido eliminado de la base de datos.`, {
        icon: '🗑️',
        style: { border: '4px solid #EE1515' }
      });
      
      setAnimalSeleccionado(null);
    } catch (error) {
      toast.error('Hubo un error al borrar el animal de la base de datos.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-pokeDark text-white p-6 rounded-xl border-4 border-pokeYellow shadow-[4px_4px_0px_0px_rgba(238,21,21,1)] mt-6">
        <div>
          <h1 className="text-3xl font-retro text-pokeLight mb-2">PC de Gestión (Admin)</h1>
          <p className="font-bold text-pokeYellow">Conectado a MySQL: Online 🟢</p>
        </div>
        <button className="mt-4 md:mt-0 bg-pokeRed text-white font-retro text-sm px-6 py-3 rounded border-4 border-white hover:bg-white hover:text-pokeRed transition-colors">
          + Añadir Nuevo
        </button>
      </div>

      <div className="poke-card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-pokeLight border-b-4 border-pokeDark text-pokeDark font-retro text-xs md:text-sm">
              <th className="p-4">ID</th>
              <th className="p-4">Foto</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Especie</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            {animales.map((animal) => (
              <tr key={animal.id} className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-500">#{animal.id}</td>
                <td className="p-4 text-3xl">{animal.emoji}</td>
                <td className="p-4 text-pokeDark text-lg">{animal.nombre}</td>
                <td className="p-4"><span className="bg-gray-200 px-2 py-1 rounded text-sm border-2 border-pokeDark uppercase">{animal.especie}</span></td>
                <td className="p-4 flex justify-center gap-2">
                  <button className="bg-pokeYellow text-pokeDark px-3 py-1 border-2 border-pokeDark rounded hover:bg-white transition-colors">
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => abrirModalBorrar(animal)}
                    className="bg-pokeRed text-white px-3 py-1 border-2 border-pokeDark rounded hover:bg-white hover:text-pokeRed transition-colors"
                  >
                    🗑️ Borrar
                  </button>
                </td>
              </tr>
            ))}
            {animales.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-8 text-gray-500 text-lg">
                  Cargando base de datos... / No hay animales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {animalSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="poke-card p-8 bg-white max-w-md w-full text-center animate-bounce-short">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-retro text-pokeRed mb-4">¡Cuidado!</h2>
            <p className="font-bold text-gray-700 text-lg mb-8">
              ¿Estás seguro de que quieres borrar a <span className="text-pokeDark text-xl"> {animalSeleccionado.nombre} {animalSeleccionado.emoji} </span> de la base de datos? Esta acción no se puede deshacer.
            </p>
            
            <div className="flex gap-4 justify-center">
              <button onClick={cancelarBorrado} className="flex-1 bg-gray-300 text-pokeDark font-retro py-3 rounded border-4 border-pokeDark hover:bg-gray-400 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmarBorrado} className="flex-1 bg-pokeRed text-white font-retro py-3 rounded border-4 border-pokeDark hover:bg-white hover:text-pokeRed transition-colors hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#222224]">
                Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;