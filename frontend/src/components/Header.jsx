import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation(); // Hook para forzar la actualización al cambiar de ruta

  // Comprobamos el estado de la sesión actual
  const token = localStorage.getItem('tokenShelterDex');
  const rol = localStorage.getItem('usuarioRol');
  const nombre = localStorage.getItem('usuarioNombre');

  const alternarMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  // Determinamos a qué panel debe ir el usuario según su rol
  const rutaPanel = rol === 'admin' ? '/admin' : '/dashboard';

  return (
    <header className="bg-pokeRed border-b-8 border-pokeDark relative z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* LOGOTIPO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-white rounded-full border-4 border-pokeDark relative overflow-hidden group-hover:animate-bounce-short">
            <div className="absolute top-1/2 w-full h-1 bg-pokeDark -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white border-2 border-pokeDark rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <span className="text-white font-retro text-2xl tracking-widest drop-shadow-[2px_2px_0px_#222224]">
            ShelterDex
          </span>
        </Link>

        {/* NAVEGACIÓN DE ESCRITORIO */}
        <nav className="hidden md:flex items-center gap-6 font-bold text-lg">
          <Link to="/" className="text-white hover:text-pokeYellow transition-colors">Inicio</Link>
          <Link to="/animales" className="text-white hover:text-pokeYellow transition-colors">Adopciones</Link>
          <Link to="/donaciones" className="text-green-300 hover:text-white transition-colors">Donar</Link>

          {token ? (
            <Link to={rutaPanel} className="bg-pokeBlue text-white px-5 py-2 rounded-full border-2 border-pokeDark hover:bg-white hover:text-pokeBlue hover:scale-105 transition-all flex items-center gap-2">
              <span className="text-sm uppercase tracking-wider">{nombre}</span>
            </Link>
          ) : (
            <Link to="/login" className="bg-pokeYellow text-pokeDark px-5 py-2 rounded-full border-2 border-pokeDark hover:bg-white hover:scale-105 transition-all">
              Iniciar Sesión
            </Link>
          )}
        </nav>

        {/* BOTÓN MENÚ MÓVIL */}
        <button 
          className="md:hidden text-white hover:text-pokeYellow focus:outline-none"
          onClick={alternarMenu}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuAbierto ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* NAVEGACIÓN MÓVIL DESPLEGABLE */}
      {menuAbierto && (
        <div className="md:hidden absolute top-full left-0 w-full bg-pokeRed border-b-4 border-pokeDark flex flex-col font-bold text-center shadow-xl">
          <Link to="/" onClick={cerrarMenu} className="p-4 border-b-2 border-pokeDark/20 text-white hover:bg-white hover:text-pokeRed transition-colors">Inicio</Link>
          <Link to="/animales" onClick={cerrarMenu} className="p-4 border-b-2 border-pokeDark/20 text-white hover:bg-white hover:text-pokeRed transition-colors">Adopciones</Link>
          <Link to="/donaciones" onClick={cerrarMenu} className="p-4 border-b-2 border-pokeDark/20 bg-green-500 text-white hover:bg-green-600 transition-colors">Donar</Link>
          
          {token ? (
            <Link to={rutaPanel} onClick={cerrarMenu} className="p-4 bg-pokeBlue text-white hover:bg-white hover:text-pokeBlue transition-colors uppercase">
              Panel de {nombre}
            </Link>
          ) : (
            <Link to="/login" onClick={cerrarMenu} className="p-4 bg-pokeYellow text-pokeDark hover:bg-white transition-colors">
              Iniciar Sesión
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;