import { Link } from 'react-router-dom';

function Terminos() {
  const ultimaActualizacion = "8 de Abril de 2026";

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      
      <div className="text-center mb-10 mt-6">
        <h1 className="text-3xl font-retro text-pokeRed mb-4">Términos de Uso</h1>
        <p className="text-lg font-bold text-gray-700">
          Última actualización: {ultimaActualizacion}
        </p>
      </div>

      {/* Contenedor del texto legal */}
      <div className="poke-card p-6 md:p-10 text-gray-700 font-semibold space-y-8 text-justify leading-relaxed">
        
        <section>
          <h2 className="text-xl font-retro text-pokeDark mb-3 border-b-4 border-pokeLight pb-2">
            1. Aceptación de los Términos
          </h2>
          <p>
            Al acceder y utilizar la plataforma SaaS <strong>ShelterDex</strong>, aceptas estar legalmente vinculado por estos Términos de Uso. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder a la plataforma ni utilizar sus servicios.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-retro text-pokeDark mb-3 border-b-4 border-pokeLight pb-2">
            2. Uso de la Plataforma
          </h2>
          <p>
            ShelterDex es una herramienta B2B (Business to Business) diseñada para la gestión integral de protectoras de animales y la retención de voluntarios. El usuario se compromete a hacer un uso adecuado y lícito de la plataforma, evitando introducir virus informáticos, intentar accesos no autorizados o sobrecargar la infraestructura del servidor.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-retro text-pokeDark mb-3 border-b-4 border-pokeLight pb-2">
            3. Sistema de Gamificación
          </h2>
          <p>
            El sistema de niveles, logros y Puntos de Experiencia (XP) tiene un propósito exclusivamente lúdico y motivacional. Los puntos acumulados <strong>no tienen valor monetario</strong>, no son transferibles y no pueden ser canjeados por dinero real ni por bienes materiales, salvo que el administrador del refugio especifique recompensas internas bajo su propia responsabilidad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-retro text-pokeDark mb-3 border-b-4 border-pokeLight pb-2">
            4. Propiedad Intelectual
          </h2>
          <p>
            Todo el código fuente, diseño gráfico, logotipos, textos y bases de datos de ShelterDex son propiedad exclusiva de Ismael Gonzalez Tempa y están protegidos por las leyes de propiedad intelectual e industrial vigentes.
          </p>
        </section>

        <div className="mt-8 pt-6 border-t-4 border-pokeDark text-center font-bold">
          <p>Para dudas legales, por favor acude a nuestro <Link to="/soporte" className="text-pokeBlue hover:underline">Centro de Ayuda</Link>.</p>
        </div>

      </div>

    </div>
  );
}

export default Terminos;