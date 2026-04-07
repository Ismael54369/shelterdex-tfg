import { Link } from 'react-router-dom';

function Header() {
  return (
    // La etiqueta header tendrá nuestro rojo Pokémon de fondo y un borde inferior oscuro
    <header className="bg-pokeRed text-white p-4 shadow-md border-b-4 border-pokeDark">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logotipo / Título: Usamos la fuente retro y el amarillo Pikachu */}
        <Link 
          to="/" 
          className="text-2xl font-retro text-pokeYellow tracking-widest drop-shadow-[2px_2px_0px_#222224] hover:scale-105 transition-transform"
        >
          ShelterDex
        </Link>

        {/* Menú de enlaces a la derecha */}
        <nav className="flex items-center gap-6 font-bold text-lg">
          <Link to="/" className="hover:text-pokeYellow transition-colors">
            Inicio
          </Link>
          <Link to="/animales" className="hover:text-pokeYellow transition-colors">
            Adopciones
          </Link>
          {/* Botón de Login con estilo de botón de consola */}
          <Link 
            to="/login" 
            className="bg-pokeYellow text-pokeDark px-5 py-2 rounded-full border-2 border-pokeDark hover:bg-white hover:scale-105 transition-all"
          >
            Iniciar Sesión
          </Link>
        </nav>
        
      </div>
    </header>
  );
}

export default Header;