import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Login() {
  // Usaremos esto más adelante para redirigir al usuario al Dashboard cuando acierte la contraseña
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); 
    // Usamos la función navigate para enviarlo al dashboard
    toast.success('¡Entrenador conectado con éxito!', {
      icon: '🎫',
    });
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[75vh]">
      
      {/* Contenedor principal estilo Pokédex */}
      <div className="poke-card p-6 w-full max-w-md bg-pokeRed relative">
        
        {/* Decoración superior: Luces de la Pokédex */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-pokeBlue border-4 border-pokeDark rounded-full shadow-[inset_-3px_-3px_0px_rgba(0,0,0,0.3)]"></div>
          <div className="w-4 h-4 bg-pokeYellow border-2 border-pokeDark rounded-full"></div>
          <div className="w-4 h-4 bg-green-500 border-2 border-pokeDark rounded-full"></div>
        </div>

        {/* Pantalla interior donde va el formulario */}
        <div className="bg-pokeLight border-4 border-pokeDark rounded-lg p-6 shadow-[inset_3px_3px_0px_rgba(0,0,0,0.1)]">
          <h2 className="text-2xl font-retro text-pokeDark mb-6 text-center">Acceso</h2>
          
          <form onSubmit={handleLogin} className="space-y-5 font-bold">
            
            {/* Campo de Email */}
            <div>
              <label className="block text-pokeDark mb-2 text-sm uppercase">Email del Voluntario:</label>
              <input 
                type="email" 
                className="w-full p-3 border-4 border-pokeDark rounded bg-white focus:outline-none focus:border-pokeBlue focus:ring-0 transition-colors"
                placeholder="ash@pueblopaleta.com"
                required
              />
            </div>
            
            {/* Campo de Contraseña */}
            <div>
              <label className="block text-pokeDark mb-2 text-sm uppercase">Contraseña secreta:</label>
              <input 
                type="password" 
                className="w-full p-3 border-4 border-pokeDark rounded bg-white focus:outline-none focus:border-pokeBlue focus:ring-0 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Botón de Enviar */}
            <button 
              type="submit" 
              className="w-full mt-2 bg-pokeYellow text-pokeDark font-retro py-4 rounded border-4 border-pokeDark hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#222224] transition-all"
            >
              Entrar
            </button>
            
          </form>

          {/* Enlace para volver atrás */}
          <div className="mt-6 text-center text-sm font-bold">
            <Link to="/" className="text-pokeBlue hover:text-pokeRed transition-colors">
              &lt; Volver al inicio
            </Link>
          </div>
          
        </div>
      </div>

    </div>
  );
}

export default Login;