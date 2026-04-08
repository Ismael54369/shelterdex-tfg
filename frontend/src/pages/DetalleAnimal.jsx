import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Simulamos la base de datos (luego esto vendrá de Node.js)
const animalesDB = [
  { id: 1, nombre: 'Rex', especie: 'Perro', edad: '3 años', peso: '25 kg', energia: 80, sociabilidad: 60, emoji: '🐶', descripcion: 'Rex es un perro muy enérgico. Le encantan los paseos largos y jugar a la pelota. Ideal para familias activas.' },
  { id: 2, nombre: 'Luna', especie: 'Gato', edad: '1 año', peso: '4 kg', energia: 40, sociabilidad: 90, emoji: '🐱', descripcion: 'Luna es muy cariñosa y tranquila. Disfruta de las siestas al sol y de los mimos en el sofá.' },
  { id: 3, nombre: 'Toby', especie: 'Perro', edad: '5 meses', peso: '8 kg', energia: 95, sociabilidad: 50, emoji: '🐕', descripcion: 'Un cachorro curioso que está aprendiendo a socializar. Necesita paciencia y mucho amor.' },
  { id: 4, nombre: 'Milo', especie: 'Gato', edad: '5 años', peso: '6 kg', energia: 30, sociabilidad: 80, emoji: '🐈', descripcion: 'Milo es un gato adulto, muy independiente pero que adora la compañía humana cuando él lo decide.' },
];

function DetalleAnimal() {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  
  // Buscamos el animal en nuestra base de datos simulada
  const animal = animalesDB.find(a => a.id === parseInt(id));

  // Si alguien pone un ID que no existe (ej: /animales/99)
  if (!animal) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-3xl font-retro text-pokeRed mb-4">¡Oh no!</h2>
        <p className="text-xl font-bold mb-6">El animal que buscas no está en nuestra base de datos.</p>
        <Link to="/animales" className="bg-pokeBlue text-white font-retro px-6 py-3 rounded border-4 border-pokeDark">Volver al Catálogo</Link>
      </div>
    );
  }

  const handleAdoptar = () => {
    toast.success('¡Solicitud de adopción enviada! Nos pondremos en contacto contigo.', { icon: '❤️' });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-6">
      
      {/* Botón de volver */}
      <button onClick={() => navigate(-1)} className="mb-6 font-bold text-pokeBlue hover:text-pokeRed flex items-center gap-2">
        <span>&lt;</span> Volver atrás
      </button>

      <div className="poke-card p-6 md:p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Columna Izquierda: Foto y datos básicos */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-pokeLight border-4 border-pokeDark rounded-xl w-full h-64 flex items-center justify-center text-8xl mb-6 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)]">
            {animal.emoji}
          </div>
          <h1 className="text-4xl font-retro text-pokeDark mb-2">{animal.nombre}</h1>
          <div className="flex gap-2 font-bold mb-4">
            <span className="bg-gray-200 px-3 py-1 rounded-full border-2 border-pokeDark uppercase text-sm">
              Nº {animal.id.toString().padStart(3, '0')}
            </span>
            <span className="bg-pokeYellow px-3 py-1 rounded-full border-2 border-pokeDark uppercase text-sm text-pokeDark">
              {animal.especie}
            </span>
          </div>
        </div>

        {/* Columna Derecha: Estadísticas y Descripción */}
        <div>
          <h3 className="font-retro text-pokeBlue mb-3">Datos Técnicos</h3>
          <div className="grid grid-cols-2 gap-4 font-bold text-sm mb-6 bg-pokeLight p-4 border-4 border-pokeDark rounded-lg">
            <p>⏳ Edad: {animal.edad}</p>
            <p>⚖️ Peso: {animal.peso}</p>
          </div>

          <h3 className="font-retro text-pokeBlue mb-3">Estadísticas</h3>
          <div className="space-y-4 mb-6 font-bold text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span>Energía (PS)</span>
                <span>{animal.energia}/100</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-4 border-2 border-pokeDark">
                <div className="bg-pokeYellow h-full rounded-full" style={{ width: `${animal.energia}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Sociabilidad</span>
                <span>{animal.sociabilidad}/100</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-4 border-2 border-pokeDark">
                <div className="bg-green-500 h-full rounded-full" style={{ width: `${animal.sociabilidad}%` }}></div>
              </div>
            </div>
          </div>

          <p className="font-bold text-gray-700 mb-8 italic">
            "{animal.descripcion}"
          </p>

          <button 
            onClick={handleAdoptar}
            className="w-full bg-pokeRed text-white font-retro py-4 rounded border-4 border-pokeDark hover:bg-white hover:text-pokeRed transition-colors hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#222224]"
          >
            ¡Quiero Adoptar!
          </button>
        </div>

      </div>
    </div>
  );
}

export default DetalleAnimal;