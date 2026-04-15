import { Link } from 'react-router-dom';

function Footer() {
  const anio = new Date().getFullYear();

  return (
    <footer className="bg-pokeDark text-gray-400 mt-auto">
      
      {/* Separador rojo */}
      <div className="h-1 bg-pokeRed"></div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Branding */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-7 h-7 bg-white rounded-full border-2 border-pokeRed relative overflow-hidden">
                <div className="absolute top-1/2 w-full h-[2px] bg-pokeDark -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white border-[1.5px] border-pokeDark rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              <span className="text-white font-retro text-lg">ShelterDex</span>
            </Link>
            <p className="text-sm font-bold leading-relaxed">
              Plataforma gamificada para la gestión integral de refugios de animales.
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Plataforma</h4>
            <div className="flex flex-col gap-2">
              <Link to="/animales" className="text-sm font-bold hover:text-pokeYellow transition-colors">Adopciones</Link>
              <Link to="/donaciones" className="text-sm font-bold hover:text-pokeYellow transition-colors">Donaciones</Link>
              <Link to="/login" className="text-sm font-bold hover:text-pokeYellow transition-colors">Acceso Voluntarios</Link>
              <Link to="/faq" className="text-sm font-bold hover:text-pokeYellow transition-colors">FAQ</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to="/terminos" className="text-sm font-bold hover:text-pokeYellow transition-colors">Términos de Uso</Link>
              <Link to="/privacidad" className="text-sm font-bold hover:text-pokeYellow transition-colors">Política de Privacidad</Link>
              <Link to="/cookies" className="text-sm font-bold hover:text-pokeYellow transition-colors">Política de Cookies</Link>
              <Link to="/soporte" className="text-sm font-bold hover:text-pokeYellow transition-colors">Soporte Técnico</Link>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Contacto</h4>
            <div className="flex flex-col gap-2 text-sm font-bold">
              <p>📧 info@shelterdex.es</p>
              <p>📱 +34 600 123 456</p>
              <p>📍 Málaga, España</p>
            </div>
          </div>

        </div>

        {/* Línea separadora + Copyright */}
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs font-bold text-gray-500">
            © {anio} ShelterDex · Ismael González Tempa · IES Playamar
          </p>
          <p className="text-xs font-bold text-gray-600">
            Hecho con 💛 para los animales que más lo necesitan
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;