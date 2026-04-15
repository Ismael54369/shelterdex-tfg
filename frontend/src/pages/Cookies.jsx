import { Link } from 'react-router-dom';

function Cookies() {
  return (
    <div>
      <div className="bg-gradient-to-b from-pokeYellow/10 to-transparent">
        <div className="container mx-auto px-4 pt-8 sm:pt-12 pb-6 max-w-3xl text-center">
          <h1 className="text-2xl sm:text-4xl font-retro text-pokeDark mb-3">Política de Cookies</h1>
          <p className="text-gray-500 font-bold">Transparencia total sobre lo que guardamos en tu navegador.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-3xl">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5 sm:p-8 space-y-6 text-gray-600 font-semibold text-sm leading-relaxed">
          
          <section>
            <h2 className="font-retro text-pokeDark mb-2">¿Qué son las cookies?</h2>
            <p>Las cookies son pequeños archivos de texto que las páginas web guardan en tu dispositivo cuando las visitas. Sirven para que la web funcione correctamente y para recordar tus preferencias, como tu sesión iniciada.</p>
          </section>

          <section>
            <h2 className="font-retro text-pokeDark mb-2">¿Qué tipo de cookies usamos?</h2>
            <p className="mb-3">En ShelterDex <strong>NO usamos cookies publicitarias ni de rastreo</strong>. Solo usamos:</p>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h3 className="font-retro text-green-700 text-xs mb-2">✅ Cookies Técnicas (Estrictamente Necesarias)</h3>
              <p className="text-green-700">Permiten mantener la sesión iniciada de voluntarios y administradores. Sin ellas, el sistema de gamificación y el panel de control no podrían funcionar. Concretamente, almacenamos un token JWT en <code className="bg-green-100 px-1 rounded">localStorage</code>.</p>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mt-3">
              <h3 className="font-retro text-red-700 text-xs mb-2">🚫 Cookies que NO usamos</h3>
              <div className="text-red-700 space-y-1">
                <p>No usamos cookies de analítica (Google Analytics).</p>
                <p>No usamos cookies publicitarias o de retargeting.</p>
                <p>No usamos cookies de redes sociales.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-retro text-pokeDark mb-2">¿Cómo gestionar tus cookies?</h2>
            <p>Puedes bloquear o eliminar las cookies desde la configuración de tu navegador. Ten en cuenta que si bloqueas las cookies técnicas, no podrás iniciar sesión en tu cuenta.</p>
          </section>

          <div className="pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-400">¿Dudas? <Link to="/soporte" className="text-pokeRed hover:underline">Contacta con nosotros</Link>.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Cookies;