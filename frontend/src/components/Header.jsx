import { useState } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  // Estado para controlar si el menú móvil está abierto o cerrado
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Función para alternar el estado
  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  // Función para cerrar el menú automáticamente al hacer clic en un enlace (muy importante para la UX)
  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    // Añadimos relative y z-50 para que el menú desplegable quede por encima de todo el contenido
    <header className="bg-pokeRed text-white p-4 shadow-md border-b-4 border-pokeDark relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logotipo */}
        <Link 
          to="/" 
          onClick={cerrarMenu}
          className="text-2xl font-retro text-pokeYellow tracking-widest drop-shadow-[2px_2px_0px_#222224] hover:scale-105 transition-transform"
        >
          ShelterDex
        </Link>

        {/* NAVEGACIÓN DE ESCRITORIO (Se oculta en móviles con "hidden", se muestra en PC con "md:flex") */}
        <nav className="hidden md:flex items-center gap-6 font-bold text-lg">
          <Link to="/" className="hover:text-pokeYellow transition-colors">
            Inicio
          </Link>
          <Link to="/animales" className="hover:text-pokeYellow transition-colors">
            Adopciones
          </Link>
          <Link to="/donaciones" className="hover:text-pokeYellow transition-colors">
            Donaciones
          </Link>
          <Link 
            to="/login" 
            className="bg-pokeYellow text-pokeDark px-5 py-2 rounded-full border-2 border-pokeDark hover:bg-white hover:scale-105 transition-all"
          >
            Iniciar Sesión
          </Link>
        </nav>

        {/* BOTÓN HAMBURGUESA (Solo visible en móviles con "md:hidden") */}
        <button 
          className="md:hidden text-pokeYellow text-3xl focus:outline-none drop-shadow-[2px_2px_0px_#222224]" 
          onClick={toggleMenu}
        >
          {menuAbierto ? '✖' : '☰'}
        </button>
        
      </div>

      {/* NAVEGACIÓN MÓVIL DESPLEGABLE (Aparece justo debajo del header si menuAbierto es true) */}
      {menuAbierto && (
        <div className="md:hidden absolute top-full left-0 w-full bg-pokeRed border-b-4 border-pokeDark flex flex-col font-bold text-center shadow-xl">
          <Link 
            to="/" 
            onClick={cerrarMenu} 
            className="p-4 border-b-2 border-pokeDark/20 hover:bg-white hover:text-pokeRed transition-colors"
          >
            Inicio
          </Link>
          <Link 
            to="/animales" 
            onClick={cerrarMenu} 
            className="p-4 border-b-2 border-pokeDark/20 hover:bg-white hover:text-pokeRed transition-colors"
          >
            Adopciones
          </Link>
          <Link 
            to="/donaciones" 
            onClick={cerrarMenu} 
            className="p-4 border-b-2 border-pokeDark/20 hover:bg-white hover:text-pokeRed transition-colors">
            Donaciones
          </Link>
          <Link 
            to="/login" 
            onClick={cerrarMenu} 
            className="p-4 bg-pokeYellow text-pokeDark hover:bg-white transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;