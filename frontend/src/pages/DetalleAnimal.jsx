import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { API_URL, urlImagen } from '../config/api';

function DetalleAnimal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [imagenes, setImagenes] = useState([]);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [relacionados, setRelacionados] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/animales/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('No encontrado');
        return res.json();
      })
      .then(datos => {
        setAnimal(datos);
        setCargando(false);
        fetch(`${API_URL}/api/animales/${id}/imagenes`)
          .then(r => r.json())
          .then(imgs => { if (Array.isArray(imgs)) setImagenes(imgs); })
          .catch(() => {});
        // Cargar animales relacionados (misma especie, diferente ID)
        fetch(`${API_URL}/api/animales`)
          .then(r => r.json())
          .then(todos => {
            if (Array.isArray(todos)) {
              setRelacionados(todos.filter(a => a.especie === datos.especie && a.id !== datos.id && a.estado !== 'Adoptado').slice(0, 3));
            }
          })
          .catch(() => {});
      })
      .catch(() => { setAnimal(null); setCargando(false); });
  }, [id]);

  const handleAdoptar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    const formData = new FormData(e.target);
    try {
      const respuesta = await fetch(`${API_URL}/api/adopciones/solicitar`, {
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🐾</div>
          <p className="font-bold text-gray-500">Cargando ficha...</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-6xl mb-4">😿</p>
          <h2 className="text-2xl font-retro text-pokeRed mb-4">Animal no encontrado</h2>
          <p className="font-bold text-gray-500 mb-6">Es posible que haya sido adoptado o que el enlace sea incorrecto.</p>
          <Link to="/animales" className="inline-block bg-pokeBlue text-white font-retro text-xs sm:text-sm px-5 py-2.5 rounded-lg border-4 border-pokeDark hover:bg-pokeYellow hover:text-pokeDark hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_#222224] transition-all">
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-5xl py-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-6">
        <Link to="/" className="hover:text-pokeDark transition-colors">Inicio</Link>
        <span>›</span>
        <Link to="/animales" className="hover:text-pokeDark transition-colors">Adopciones</Link>
        <span>›</span>
        <span className="text-pokeDark">{animal.nombre}</span>
      </nav>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

        {/* COLUMNA IZQUIERDA: Galería (3/5) */}
        <div className="lg:col-span-3">
          <div className="bg-pokeLight border-4 border-pokeDark rounded-xl w-full aspect-[4/3] flex items-center justify-center overflow-hidden relative shadow-[4px_4px_0px_0px_#222224]">
            {imagenes.length > 0 ? (
              <>
                <img src={urlImagen(imagenes[imagenActiva]?.ruta)} alt={animal.nombre} className="w-full h-full object-cover" />
                {imagenes.length > 1 && (
                  <>
                    <button
                      onClick={() => setImagenActiva(imagenActiva > 0 ? imagenActiva - 1 : imagenes.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70 text-xl"
                    >‹</button>
                    <button
                      onClick={() => setImagenActiva(imagenActiva < imagenes.length - 1 ? imagenActiva + 1 : 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70 text-xl"
                    >›</button>
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full">{imagenActiva + 1}/{imagenes.length}</span>
                  </>
                )}
              </>
            ) : animal.imagen ? (
              <img src={urlImagen(animal.imagen)} alt={animal.nombre} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">{animal.emoji}</span>
            )}
          </div>

          {/* Miniaturas */}
          {imagenes.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {imagenes.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setImagenActiva(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-4 transition-all ${
                    imagenActiva === index ? 'border-pokeYellow shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'border-gray-300 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={urlImagen(img.ruta)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Descripción (debajo de la galería en pantallas grandes) */}
          <div className="hidden lg:block mt-6">
            <h3 className="font-retro text-pokeDark mb-3">Sobre {animal.nombre}</h3>
            <p className="text-gray-600 font-semibold leading-relaxed">{animal.descripcion || 'Este animal aún no tiene una descripción detallada.'}</p>
          </div>
        </div>

        {/* COLUMNA DERECHA: Info + Adopción (2/5) */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Nombre y badges */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                animal.estado === 'Refugio' ? 'bg-blue-500 text-white' :
                animal.estado === 'Acogida' ? 'bg-yellow-400 text-pokeDark' :
                'bg-green-500 text-white'
              }`}>{animal.estado}</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-200 text-pokeDark border-2 border-pokeDark uppercase">{animal.especie}</span>
              <span className="text-xs font-bold text-gray-400">Nº {animal.id.toString().padStart(3, '0')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-retro text-pokeDark">{animal.nombre}</h1>
          </div>

          {/* Datos técnicos */}
          <div className="bg-pokeLight border-4 border-pokeDark rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3 font-bold text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏳</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Edad</p>
                  <p className="text-pokeDark">{animal.edad || 'Desconocida'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⚖️</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Peso</p>
                  <p className="text-pokeDark">{animal.peso || 'Desconocido'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white border-4 border-pokeDark rounded-lg p-4 shadow-[4px_4px_0px_0px_#222224]">
            <h3 className="font-retro text-pokeDark text-sm mb-3">Estadísticas</h3>
            <div className="space-y-3 font-bold text-sm">
              <div>
                <div className="flex justify-between mb-1 text-gray-600">
                  <span>⚡ Energía</span>
                  <span>{animal.energia}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-pokeYellow h-full rounded-full" style={{ width: `${animal.energia}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-gray-600">
                  <span>💙 Sociabilidad</span>
                  <span>{animal.sociabilidad}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-pokeBlue h-full rounded-full" style={{ width: `${animal.sociabilidad}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción (solo en móvil, debajo de stats) */}
          <div className="lg:hidden">
            <h3 className="font-retro text-pokeDark mb-2">Sobre {animal.nombre}</h3>
            <p className="text-gray-600 font-semibold text-sm leading-relaxed">{animal.descripcion || 'Este animal aún no tiene una descripción detallada.'}</p>
          </div>

          {/* Adopción */}
          {animal.estado === 'Adoptado' ? (
            <div className="bg-green-50 text-green-700 font-bold py-4 px-4 rounded-lg border-2 border-green-300 text-center">
              ✅ Este animal ya ha encontrado su hogar
            </div>
          ) : !mostrarFormulario ? (
            <button 
              onClick={() => setMostrarFormulario(true)}
              className="w-full bg-pokeRed text-white font-retro py-4 rounded-lg border-4 border-pokeDark hover:bg-pokeYellow hover:text-pokeDark hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#222224] transition-all text-lg"
            >
              ❤️ ¡Quiero Adoptarle!
            </button>
          ) : (
            <div className="bg-white border-4 border-pokeDark rounded-lg p-4 shadow-[4px_4px_0px_0px_#222224]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-retro text-pokeDark text-sm">Solicitud de Adopción</h3>
                <button onClick={() => setMostrarFormulario(false)} className="text-xl font-bold text-gray-400 hover:text-pokeRed">✕</button>
              </div>
              <form onSubmit={handleAdoptar} className="space-y-3 font-bold text-sm">
                <div>
                  <label className="block uppercase text-xs text-gray-500 mb-1">Nombre completo *</label>
                  <input type="text" name="nombre_solicitante" required className="w-full p-2 border-4 border-gray-200 rounded-lg bg-white focus:border-pokeDark focus:outline-none" placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block uppercase text-xs text-gray-500 mb-1">Email *</label>
                  <input type="email" name="email" required className="w-full p-2 border-4 border-gray-200 rounded-lg bg-white focus:border-pokeDark focus:outline-none" placeholder="tu@email.com" />
                </div>
                <div>
                  <label className="block uppercase text-xs text-gray-500 mb-1">Teléfono *</label>
                  <input type="tel" name="telefono" required className="w-full p-2 border-4 border-gray-200 rounded-lg bg-white focus:border-pokeDark focus:outline-none" placeholder="600 123 456" />
                </div>
                <div>
                  <label className="block uppercase text-xs text-gray-500 mb-1">Mensaje (opcional)</label>
                  <textarea name="mensaje" rows="2" className="w-full p-2 border-4 border-gray-200 rounded-lg bg-white focus:border-pokeDark focus:outline-none" placeholder="¿Por qué quieres adoptarle?"></textarea>
                </div>
                <button type="submit" disabled={enviando} className="w-full bg-pokeRed text-white font-retro py-2.5 rounded-lg border-4 border-pokeDark hover:bg-pokeYellow hover:text-pokeDark transition-all disabled:opacity-50 text-xs sm:text-sm">
                  {enviando ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </form>
            </div>
          )}

          {/* Link a donaciones */}
          <Link to="/donaciones" className="block text-center text-sm font-bold text-gray-400 hover:text-pokeRed transition-colors">
            ¿No puedes adoptar? También puedes ayudar con una donación →
          </Link>
        </div>
      </div>

      {/* Animales relacionados */}
      {relacionados.length > 0 && (
        <section className="mt-12 pt-8 border-t-4 border-pokeDark/10">
          <h2 className="text-lg sm:text-2xl font-retro text-pokeDark mb-6 text-center">También podrían interesarte</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relacionados.map((rel) => (
              <Link to={`/animales/${rel.id}`} key={rel.id} className="poke-card overflow-hidden group hover:-translate-y-1 transition-transform" onClick={() => window.scrollTo(0, 0)}>
                <div className="h-60 bg-pokeLight flex items-center justify-center overflow-hidden">
                  {rel.imagen
                    ? <img src={urlImagen(rel.imagen)} alt={rel.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <span className="text-5xl">{rel.emoji}</span>
                  }
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-retro text-pokeDark">{rel.nombre}</h3>
                    <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded-full border border-pokeDark uppercase">{rel.especie}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

export default DetalleAnimal;