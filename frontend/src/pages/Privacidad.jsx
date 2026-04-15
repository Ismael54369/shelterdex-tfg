import { Link } from 'react-router-dom';

function Privacidad() {
  return (
    <div>
      <div className="bg-gradient-to-b from-pokeBlue/10 to-transparent">
        <div className="container mx-auto px-4 pt-8 sm:pt-12 pb-6 max-w-3xl text-center">
          <h1 className="text-2xl sm:text-4xl font-retro text-pokeDark mb-3">Política de Privacidad</h1>
          <p className="text-gray-500 font-bold">Tu privacidad es tan importante como encontrar un hogar para nuestros animales.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-3xl">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5 sm:p-8 space-y-6 text-gray-600 font-semibold text-sm leading-relaxed">
          
          <section>
            <h2 className="font-retro text-pokeDark mb-2">Responsable del Tratamiento</h2>
            <p>El responsable de los datos recogidos es <strong>Ismael González Tempa</strong>. Para consultas sobre datos personales: <span className="text-pokeRed">privacidad@shelterdex.es</span>.</p>
          </section>

          <section>
            <h2 className="font-retro text-pokeDark mb-2">Finalidad del Tratamiento</h2>
            <p className="mb-2">Tratamos tus datos para:</p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p>🐾 Gestionar tu cuenta de voluntario y tu progreso (Niveles y XP).</p>
              <p>📋 Coordinar las tareas de cuidado de los animales en el refugio.</p>
              <p>🏠 Gestionar el catálogo de animales en adopción y las solicitudes.</p>
              <p>💬 Responder a tus consultas a través del formulario de soporte.</p>
            </div>
          </section>

          <section>
            <h2 className="font-retro text-pokeDark mb-2">Tus Derechos (ARCO+)</h2>
            <p>Tienes derecho a acceder, rectificar y suprimir tus datos, así como a la portabilidad y limitación del tratamiento. Para ejercerlos, envía una solicitud a nuestro <Link to="/soporte" className="text-pokeRed hover:underline">Centro de Soporte</Link>.</p>
          </section>

          <section>
            <h2 className="font-retro text-pokeDark mb-2">Seguridad</h2>
            <div className="bg-pokeDark text-white rounded-lg p-4 flex flex-wrap gap-4 text-xs font-bold">
              <span className="flex items-center gap-1">🔒 Cifrado SSL</span>
              <span className="flex items-center gap-1">🛡️ JWT con expiración 24h</span>
              <span className="flex items-center gap-1">🔐 Contraseñas con bcrypt</span>
              <span className="flex items-center gap-1">🚫 No vendemos datos a terceros</span>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Privacidad;