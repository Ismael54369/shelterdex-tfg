import { Link } from 'react-router-dom';

function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="bg-pokeDark text-pokeLight mt-auto border-t-8 border-pokeRed pb-8 pt-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Sección Izquierda: Branding */}
        <div className="text-center md:text-left">
          <h3 className="text-xl font-retro text-pokeYellow mb-2">ShelterDex</h3>
          <p className="font-bold text-sm text-gray-400">
            Gamificando la adopción responsable.
          </p>
        </div>

        {/* Sección Central: Enlaces legales y de soporte */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-bold text-xs uppercase max-w-md">
          <Link to="/faq" className="hover:text-pokeYellow transition-colors">Preguntas Frecuentes</Link>
          <Link to="/soporte" className="hover:text-pokeYellow transition-colors">Atención al Cliente</Link>
          <Link to="/terminos" className="hover:text-pokeYellow transition-colors">Términos de Uso</Link>
          <Link to="/privacidad" className="hover:text-pokeYellow transition-colors">Privacidad</Link>
          <Link to="/cookies" className="hover:text-pokeYellow transition-colors">Cookies</Link>
        </div>

        {/* Sección Derecha: Copyright y Autoría */}
        <div className="text-center md:text-right font-bold text-xs text-gray-500">
          <p>© {anioActual} Ismael Gonzalez Tempa.</p>
          <p>Todos los derechos reservados.</p>
<p className="text-pokeYellow mt-1 text-[10px] sm:text-xs">Diseñado y desarrollado por Ismael Gonzalez Tempa</p>        </div>

      </div>
    </footer>
  );
}

export default Footer;