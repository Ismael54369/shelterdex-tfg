import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config/api';

function Login() {
  const navigate = useNavigate();
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (cargando) return;

    if (esRegistro) {
      const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!regexPassword.test(password)) {
        toast.error('Contraseña débil: Usa mínimo 8 caracteres, combinando letras y números.', { icon: '🛡️', duration: 5000 });
        return;
      }
    }

    setCargando(true);
    const url = esRegistro ? `${API_URL}/api/registro` : `${API_URL}/api/login`;
    const payload = esRegistro ? { nombre, email, password } : { email, password };

    try {
      const respuesta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) { toast.error(datos.error || 'Hubo un problema'); return; }

      if (esRegistro) {
        toast.success('Cuenta creada con éxito. Ahora inicia sesión.');
        setEsRegistro(false); setPassword('');
      } else {
        localStorage.setItem('tokenShelterDex', datos.token);
        localStorage.setItem('usuarioNombre', datos.usuario.nombre);
        localStorage.setItem('usuarioRol', datos.usuario.rol);
        localStorage.setItem('usuarioId', datos.usuario.id);
        toast.success(`Bienvenido de nuevo, ${datos.usuario.nombre}`);
        navigate(datos.usuario.rol === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      toast.error('No se pudo conectar con el servidor. ¿Está encendido?');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Pokéball Header */}
        <div className="bg-pokeRed rounded-t-2xl border-4 border-b-0 border-pokeDark p-4 sm:p-6 relative overflow-hidden">
          {/* Línea central de la Pokéball */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-pokeDark"></div>
          
          {/* LEDs decorativos */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-pokeBlue border-4 border-pokeDark rounded-full shadow-[inset_-3px_-3px_0px_rgba(0,0,0,0.3)] relative">
              <div className="absolute top-1 left-1 w-3 h-3 bg-white/40 rounded-full"></div>
            </div>
            <div className="w-3 h-3 bg-pokeYellow border-2 border-pokeDark rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 border-2 border-pokeDark rounded-full"></div>
          </div>

          {/* Título */}
          <h1 className="text-xl sm:text-2xl font-retro text-white">
            {esRegistro ? 'Nuevo Entrenador' : 'Acceso al Sistema'}
          </h1>
          <p className="text-white/60 font-bold text-sm mt-1">
            {esRegistro ? 'Únete a la comunidad de voluntarios' : 'Identifícate para continuar'}
          </p>
        </div>

        {/* Formulario (parte blanca de la Pokéball) */}
        <div className="bg-white rounded-b-2xl border-4 border-t-0 border-pokeDark p-5 sm:p-8 shadow-[4px_4px_0px_0px_#222224]">
          
          {/* Toggle Login/Registro */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setEsRegistro(false)}
              className={`flex-1 font-bold py-2 text-sm rounded-lg border-2 transition-all ${
                !esRegistro ? 'bg-pokeDark text-white border-pokeDark' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-400'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setEsRegistro(true)}
              className={`flex-1 font-bold py-2 text-sm rounded-lg border-2 transition-all ${
                esRegistro ? 'bg-pokeDark text-white border-pokeDark' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-400'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-bold">
            
            {esRegistro && (
              <div>
                <label className="block text-gray-500 mb-1 text-xs uppercase">Tu Nombre</label>
                <input 
                  type="text" value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-3 border-4 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-pokeDark transition-colors"
                  placeholder="Ash Ketchum"
                  required={esRegistro}
                />
              </div>
            )}
            
            <div>
              <label className="block text-gray-500 mb-1 text-xs uppercase">Email</label>
              <input 
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-4 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-pokeDark transition-colors"
                placeholder="ash@pueblopaleta.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-500 mb-1 text-xs uppercase">Contraseña</label>
              <input 
                type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border-4 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-pokeDark transition-colors"
                placeholder="••••••••"
                required
              />
              {esRegistro && (
                <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres, combinando letras y números.</p>
              )}
            </div>

            <button 
              type="submit" disabled={cargando}
              className="w-full bg-pokeRed text-white font-retro py-2.5 sm:py-3 rounded-lg border-4 border-pokeDark hover:bg-pokeYellow hover:text-pokeDark hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_#222224] transition-all disabled:opacity-50 disabled:hover:translate-y-0 text-xs sm:text-sm"
            >
              {cargando ? 'Cargando...' : esRegistro ? 'Crear mi Cuenta' : 'Entrar'}
            </button>
          </form>

          {/* Links adicionales */}
          <div className="mt-6 pt-4 border-t-2 border-gray-100 text-center">
            <Link to="/" className="text-sm font-bold text-gray-400 hover:text-pokeDark transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;