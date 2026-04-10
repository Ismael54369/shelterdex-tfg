import { Link } from 'react-router-dom';

function Privacidad() {
  const responsable = "Ismael Gonzalez Tempa";
  const contacto = "privacidad@shelterdex.es";

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      
      <div className="text-center mb-10 mt-6">
        <h1 className="text-3xl font-retro text-pokeRed mb-4">Política de Privacidad</h1>
        <p className="text-lg font-bold text-gray-700">
          Tu privacidad es tan importante como encontrar un hogar para nuestros animales.
        </p>
      </div>

      <div className="poke-card p-6 md:p-10 bg-white text-gray-700 font-semibold space-y-8 text-justify">
        
        <section>
          <h2 className="text-xl font-retro text-pokeBlue mb-3 flex items-center gap-2">
            Responsable del Tratamiento
          </h2>
          <p>
            El responsable de los datos recogidos en esta plataforma es <strong>{responsable}</strong>. 
            Para cualquier consulta relacionada con tus datos personales, puedes contactar con nosotros en 
            la dirección: <span className="text-pokeRed underline">{contacto}</span>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-retro text-pokeBlue mb-3 border-b-4 border-pokeLight pb-2">
            Finalidad del Tratamiento
          </h2>
          <p className="mb-4">Tratamos tus datos personales con las siguientes finalidades:</p>
          <ul className="list-disc ml-8 space-y-2">
            <li>Gestionar tu cuenta de voluntario y tu progreso (Niveles y XP).</li>
            <li>Coordinar las tareas de cuidado y mantenimiento de los animales en el refugio.</li>
            <li>Gestionar y publicar el catálogo de animales en adopción.</li>
            <li>Responder a tus consultas a través del formulario de atención al cliente.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-retro text-pokeBlue mb-3 border-b-4 border-pokeLight pb-2">
            Tus Derechos (ARCO+)
          </h2>
          <p>
            Tienes derecho a acceder, rectificar y suprimir tus datos, así como a la portabilidad de los mismos o a la limitación de su tratamiento. Para ejercer estos derechos, simplemente envía una solicitud a nuestro <Link to="/soporte" className="text-pokeRed hover:underline">Centro de Soporte</Link>.
          </p>
        </section>

        <section className="bg-pokeLight p-4 rounded-lg border-2 border-pokeDark text-sm">
          <p>
            <strong>Nota técnica:</strong> ShelterDex utiliza cifrado SSL para asegurar que tus datos viajen de forma segura entre tu navegador y nuestro servidor. No vendemos tus datos a terceros ni los utilizamos para fines publicitarios externos.
          </p>
        </section>

      </div>
    </div>
  );
}

export default Privacidad;