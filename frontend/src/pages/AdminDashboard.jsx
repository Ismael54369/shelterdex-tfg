import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [animales, setAnimales] = useState([]);
  
  // Estados para los modales
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null); // Para borrar
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false); // Para crear
  
  // NUEVOS ESTADOS PARA EDITAR
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [animalAEditar, setAnimalAEditar] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/animales')
      .then(respuesta => respuesta.json())
      .then(datos => setAnimales(datos))
      .catch(error => console.error("Error cargando la base de datos:", error));
  }, []);

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
    const formData = new FormData(e.target);
    const nuevoAnimal = Object.fromEntries(formData.entries());

    try {
      const respuesta = await fetch('http://localhost:3000/api/animales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoAnimal)
      });
      const resultado = await respuesta.json();
      
      if (respuesta.ok) {
        setAnimales([...animales, { ...nuevoAnimal, id: resultado.id, estado: 'Refugio' }]);
        toast.success(`¡${nuevoAnimal.nombre} añadido!`, { icon: '✨' });
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
    const datosActualizados = Object.fromEntries(formData.entries());

    // Nos aseguramos de mantener los datos numéricos que no están en el formulario básico
    const animalCompleto = {
      ...animalAEditar,
      ...datosActualizados
    };

    try {
      const respuesta = await fetch(`http://localhost:3000/api/animales/${animalAEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animalCompleto)
      });
      
      if (respuesta.ok) {
        // Actualizamos la lista local mapeando y cambiando solo el modificado
        const nuevaLista = animales.map(a => 
          a.id === animalAEditar.id ? animalCompleto : a
        );
        setAnimales(nuevaLista);
        
        toast.success(`Ficha de ${animalCompleto.nombre} actualizada`, { icon: '📝' });
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
          <h1 className="text-3xl font-retro text-pokeLight mb-2">PC de Gestión (Admin)</h1>
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

      <div className="poke-card overflow-x-auto">
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
                <td className="p-4 text-3xl">{animal.emoji}</td>
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
                  <label className="block text-sm uppercase mb-1">Edad</label>
                  <input type="text" name="edad" defaultValue={animalAEditar.edad} required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" />
                </div>
                <div>
                  <label className="block text-sm uppercase mb-1">Peso</label>
                  <input type="text" name="peso" defaultValue={animalAEditar.peso} required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" />
                </div>
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

    </div>
  );
}

export default AdminDashboard;