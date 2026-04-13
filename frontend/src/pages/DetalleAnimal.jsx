import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function DetalleAnimal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/api/animales/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('No encontrado');
        return res.json();
      })
      .then(datos => {
        setAnimal(datos);
        setCargando(false);
      })
      .catch(() => {
        setAnimal(null);
        setCargando(false);
      });
  }, [id]);

  const handleAdoptar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);

    const formData = new FormData(e.target);

    try {
      const respuesta = await fetch('http://localhost:3000/api/adopciones/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animal_id: animal.id,
          nombre_solicitante: formData.get('nombre_solicitante'),
          email: formData.get('email'),
          telefono: formData.get('telefono'),
          mensaje: formData.get('mensaje')
        })
      });

      const datos = await respuesta.json();

          if (respuesta.ok) {
            toast.success('¡Solicitud enviada! El refugio se pondrá en contacto contigo.', { icon: '❤️', duration: 6000 });
            setMostrarFormulario(false);
          } else {
            toast.error(datos.error || 'Error al enviar la solicitud.');
          }
        } catch (error) {
          toast.error('Error de conexión. Inténtalo de nuevo.');
        } finally {
          setEnviando(false);
        }
      };

  if (cargando) {
    return (
      <div className="text-center mt-20">
        <p className="text-xl font-bold text-gray-500">Cargando ficha...</p>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-3xl font-retro text-pokeRed mb-4">¡Oh no!</h2>
        <p className="text-xl font-bold mb-6">El animal que buscas no está en nuestra base de datos.</p>
        <Link to="/animales" className="bg-pokeBlue text-white font-retro px-6 py-3 rounded border-4 border-pokeDark">Volver al Catálogo</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-6">
      
      <button onClick={() => navigate(-1)} className="mb-6 font-bold text-pokeBlue hover:text-pokeRed flex items-center gap-2">
        <span>&lt;</span> Volver atrás
      </button>

      <div className="poke-card p-4 sm:p-6 md:p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
        
        {/* Columna Izquierda: Foto y datos básicos */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-pokeLight border-4 border-pokeDark rounded-xl w-full h-64 flex items-center justify-center mb-6 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] overflow-hidden">
            {animal.imagen 
              ? <img src={`http://localhost:3000${animal.imagen}`} alt={animal.nombre} className="w-full h-full object-cover" />
              : <span className="text-8xl">{animal.emoji}</span>
            }
          </div>
          <h1 className="text-2xl sm:text-4xl font-retro text-pokeDark mb-2">{animal.nombre}</h1>
          <div className="flex gap-2 font-bold mb-4 flex-wrap justify-center">
            <span className="bg-gray-200 px-3 py-1 rounded-full border-2 border-pokeDark uppercase text-sm">
              Nº {animal.id.toString().padStart(3, '0')}
            </span>
            <span className="bg-pokeYellow px-3 py-1 rounded-full border-2 border-pokeDark uppercase text-sm text-pokeDark">
              {animal.especie}
            </span>
            <span className={`px-3 py-1 rounded-full border-2 uppercase text-sm font-bold ${
              animal.estado === 'Refugio' ? 'bg-blue-100 text-blue-700 border-blue-300' :
              animal.estado === 'Acogida' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
              'bg-green-100 text-green-700 border-green-300'
            }`}>
              {animal.estado}
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
                <div className="bg-pokeBlue h-full rounded-full" style={{ width: `${animal.sociabilidad}%` }}></div>
              </div>
            </div>
          </div>

          <h3 className="font-retro text-pokeBlue mb-3">Descripción</h3>
          <p className="text-gray-700 font-semibold mb-6 leading-relaxed">{animal.descripcion}</p>

          {/* Botón o formulario de adopción */}
          {animal.estado === 'Adoptado' ? (
            <div className="w-full bg-green-100 text-green-700 font-bold py-4 rounded border-4 border-green-400 text-center">
              ✅ Este animal ya ha sido adoptado
            </div>
          ) : !mostrarFormulario ? (
            <button 
              onClick={() => setMostrarFormulario(true)}
              className="w-full bg-pokeRed text-white font-retro py-4 rounded border-4 border-pokeDark hover:bg-pokeYellow hover:text-pokeDark transition-colors"
            >
              ¡Quiero Adoptarle!
            </button>
          ) : (
            <div className="bg-pokeLight border-4 border-pokeDark rounded-lg p-4 mt-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-retro text-pokeDark">Solicitud de Adopción</h3>
                <button 
                  onClick={() => setMostrarFormulario(false)} 
                  className="text-xl font-bold text-gray-500 hover:text-pokeRed"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAdoptar} className="space-y-3 font-bold text-sm">
                <div>
                  <label className="block uppercase mb-1">Nombre completo *</label>
                  <input 
                    type="text" name="nombre_solicitante" required 
                    className="w-full p-2 border-4 border-pokeDark rounded bg-white"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase mb-1">Email *</label>
                    <input 
                      type="email" name="email" required 
                      className="w-full p-2 border-4 border-pokeDark rounded bg-white"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block uppercase mb-1">Teléfono *</label>
                    <input 
                      type="tel" name="telefono" required 
                      className="w-full p-2 border-4 border-pokeDark rounded bg-white"
                      placeholder="600 123 456"
                    />
                  </div>
                </div>
                <div>
                  <label className="block uppercase mb-1">Mensaje (opcional)</label>
                  <textarea 
                    name="mensaje" rows="3" 
                    className="w-full p-2 border-4 border-pokeDark rounded bg-white"
                    placeholder="¿Por qué quieres adoptar a este animal? ¿Tienes experiencia?"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={enviando}
                  className="w-full bg-pokeRed text-white font-retro py-3 rounded border-4 border-pokeDark hover:bg-pokeYellow hover:text-pokeDark transition-colors disabled:opacity-50"
                >
                  {enviando ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default DetalleAnimal;