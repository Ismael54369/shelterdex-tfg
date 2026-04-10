import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Login() {
  const navigate = useNavigate();
  
  // Estado para alternar entre "Iniciar Sesión" y "Crear Cuenta"
  const [esRegistro, setEsRegistro] = useState(false);
  
  // Estados para guardar lo que escribe el usuario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    // ==========================================
    // VALIDACIÓN DE SEGURIDAD (Solo en Registro)
    // ==========================================
    if (esRegistro) {
      // Expresión regular: Mínimo 8 caracteres, al menos una letra y un número
      const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      
      if (!regexPassword.test(password)) {
        toast.error('Contraseña débil: Usa mínimo 8 caracteres, combinando letras y números.', {
          icon: '🛡️',
          duration: 5000,
          style: { border: '4px solid #EE1515' } // Borde rojo para que destaque
        });
        return; // Detenemos la función para no enviar basura al servidor
      }
    }

    // ==========================================
    // PETICIÓN AL SERVIDOR
    // ==========================================
    const url = esRegistro 
      ? 'http://localhost:3000/api/registro' 
      : 'http://localhost:3000/api/login';
      
    const payload = esRegistro 
      ? { nombre, email, password } 
      : { email, password };

    try {
      const respuesta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        // Si el backend nos da un error (ej: email repetido o mala contraseña)
        toast.error(datos.error || 'Hubo un problema');
        return;
      }

      // SI TODO HA IDO BIEN:
      if (esRegistro) {
        toast.success('Cuenta creada con éxito. Ahora inicia sesión.');
        setEsRegistro(false); 
        setPassword(''); 
      } else {
        // ES LOGIN: Guardamos todos los datos de sesión
        localStorage.setItem('tokenShelterDex', datos.token);
        localStorage.setItem('usuarioNombre', datos.usuario.nombre);
        localStorage.setItem('usuarioRol', datos.usuario.rol); // NUEVO: Guardamos el rol
        localStorage.setItem('usuarioId', datos.usuario.id);
        
        toast.success(`Bienvenido de nuevo, ${datos.usuario.nombre}`);
        
        // Redirección condicional basada en el rol
        if (datos.usuario.rol === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard'); // Los voluntarios van a su propio panel
        }
      }

    } catch (error) {
      console.error('Error de red:', error);
      toast.error('No se pudo conectar con el servidor. ¿Está encendido?');
    }
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[75vh]">
      <div className="poke-card p-6 w-full max-w-md bg-pokeRed relative transition-all duration-500">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-pokeBlue border-4 border-pokeDark rounded-full shadow-[inset_-3px_-3px_0px_rgba(0,0,0,0.3)]"></div>
          <div className="w-4 h-4 bg-pokeYellow border-2 border-pokeDark rounded-full"></div>
          <div className="w-4 h-4 bg-green-500 border-2 border-pokeDark rounded-full"></div>
        </div>

        <div className="bg-pokeLight border-4 border-pokeDark rounded-lg p-6 shadow-[inset_3px_3px_0px_rgba(0,0,0,0.1)]">
          <h2 className="text-2xl font-retro text-pokeDark mb-6 text-center">
            {esRegistro ? 'Nuevo Entrenador' : 'Acceso al Sistema'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 font-bold">
            
            {esRegistro && (
              <div>
                <label className="block text-pokeDark mb-1 text-sm uppercase">Tu Nombre:</label>
                <input 
                  type="text" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2 border-4 border-pokeDark rounded bg-white focus:outline-none focus:border-pokeBlue"
                  placeholder="Ash Ketchum"
                  required={esRegistro}
                />
              </div>
            )}
            
            <div>
              <label className="block text-pokeDark mb-1 text-sm uppercase">Email:</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border-4 border-pokeDark rounded bg-white focus:outline-none focus:border-pokeBlue"
                placeholder="ash@pueblopaleta.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-pokeDark mb-1 text-sm uppercase">Contraseña:</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border-4 border-pokeDark rounded bg-white focus:outline-none focus:border-pokeBlue"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 bg-pokeYellow text-pokeDark font-retro py-3 rounded border-4 border-pokeDark hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#222224] transition-all"
            >
              {esRegistro ? 'Registrarme' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-bold border-t-2 border-pokeDark/20 pt-4">
            <p className="mb-2 text-gray-600">
              {esRegistro ? '¿Ya tienes una cuenta?' : '¿Eres un nuevo voluntario?'}
            </p>
            <button 
              onClick={() => setEsRegistro(!esRegistro)}
              className="text-pokeBlue hover:text-pokeRed transition-colors underline"
              type="button"
            >
              {esRegistro ? 'Ir a Iniciar Sesión' : 'Crear una cuenta nueva'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Login;