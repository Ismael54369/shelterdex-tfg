import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  const token = localStorage.getItem('tokenShelterDex');
  const rol = localStorage.getItem('usuarioRol');
  const nombre = localStorage.getItem('usuarioNombre');

  const cerrarMenu = () => setMenuAbierto(false);
  const rutaPanel = rol === 'admin' ? '/admin' : '/dashboard';

  // Comprobar si un link es la ruta activa
  const esActiva = (ruta) => location.pathname === ruta;

  const enlaces = [
    { to: '/', label: 'Inicio' },
    { to: '/animales', label: 'Adopciones' },
    { to: '/donaciones', label: 'Donar', especial: true },
  ];

  return (
    <header className="bg-pokeDark sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          
          {/* LOGO */}
          <Link to="/" onClick={cerrarMenu} className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full border-[3px] border-pokeRed relative overflow-hidden group-hover:scale-110 transition-transform">
              <div className="absolute top-1/2 w-full h-[2px] bg-pokeDark -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-white border-2 border-pokeDark rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            <span className="text-white font-retro text-lg sm:text-xl tracking-wider">
              ShelterDex
            </span>
          </Link>

          {/* NAV ESCRITORIO */}
          <nav className="hidden md:flex items-center gap-1">
            {enlaces.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  link.especial
                    ? 'text-green-400 hover:bg-green-500/10 hover:text-green-300'
                    : esActiva(link.to)
                      ? 'bg-white/10 text-pokeYellow'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-6 bg-white/20 mx-2"></div>

            {token ? (
              <Link 
                to={rutaPanel} 
                className="bg-pokeRed text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-pokeRed/80 transition-all flex items-center gap-2"
              >
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">
                  {nombre?.charAt(0).toUpperCase()}
                </div>
                {nombre}
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="bg-pokeYellow text-pokeDark px-5 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 transition-all"
              >
                Iniciar Sesión
              </Link>
            )}
          </nav>

          {/* BOTÓN MENÚ MÓVIL */}
          <button 
            className="md:hidden text-white hover:text-pokeYellow focus:outline-none p-1"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuAbierto 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {menuAbierto && (
        <div className="md:hidden bg-pokeDark border-t border-white/10">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {enlaces.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={cerrarMenu}
                className={`p-3 rounded-lg font-bold text-sm transition-colors ${
                  link.especial
                    ? 'text-green-400 hover:bg-green-500/10'
                    : esActiva(link.to)
                      ? 'bg-white/10 text-pokeYellow'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-white/10 my-1"></div>

            {token ? (
              <Link to={rutaPanel} onClick={cerrarMenu} className="p-3 rounded-lg bg-pokeRed/20 text-pokeRed font-bold text-sm hover:bg-pokeRed/30 transition-colors flex items-center gap-2">
                <div className="w-6 h-6 bg-pokeRed/30 rounded-full flex items-center justify-center text-xs text-white">{nombre?.charAt(0).toUpperCase()}</div>
                Panel de {nombre}
              </Link>
            ) : (
              <Link to="/login" onClick={cerrarMenu} className="p-3 rounded-lg bg-pokeYellow text-pokeDark font-bold text-sm text-center hover:bg-yellow-300 transition-colors">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;