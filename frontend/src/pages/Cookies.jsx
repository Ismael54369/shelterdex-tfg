import { Link } from 'react-router-dom';

function Cookies() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      
      <div className="text-center mb-10 mt-6">
        <h1 className="text-3xl font-retro text-pokeRed mb-4">Política de Cookies</h1>
        <p className="text-lg font-bold text-gray-700">
          Transparencia total sobre lo que guardamos en tu navegador.
        </p>
      </div>

      <div className="poke-card p-6 md:p-10 bg-white text-gray-700 font-semibold space-y-8 text-justify">
        
        <section>
          <h2 className="text-xl font-retro text-pokeDark mb-3 border-b-4 border-pokeLight pb-2">
            ¿Qué son las cookies?
          </h2>
          <p>
            Las cookies son pequeños archivos de texto que las páginas web guardan en tu ordenador o dispositivo móvil cuando las visitas. Sirven para que la página web funcione correctamente, para que sea más eficiente y para recordar tus preferencias (como tu sesión iniciada).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-retro text-pokeDark mb-3 border-b-4 border-pokeLight pb-2">
            ¿Qué tipo de cookies utilizamos?
          </h2>
          <p className="mb-4">En ShelterDex <strong>NO utilizamos cookies publicitarias ni de rastreo invasivo</strong>. Solo utilizamos las siguientes:</p>
          
          <div className="bg-pokeLight p-4 rounded border-2 border-pokeDark mb-4">
            <h3 className="font-retro text-sm text-pokeBlue mb-2">Cookies Técnicas (Estrictamente Necesarias)</h3>
            <p className="text-sm">
              Son aquellas que permiten al usuario la navegación a través de la plataforma y la utilización de sus diferentes opciones, como controlar el tráfico y la comunicación de datos, o <strong>mantener la sesión iniciada</strong> de los voluntarios y administradores. Sin ellas, el sistema de gamificación y el panel de control no podrían funcionar.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-retro text-pokeDark mb-3 border-b-4 border-pokeLight pb-2">
            ¿Cómo gestionar tus cookies?
          </h2>
          <p>
            Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador instalado en tu ordenador. Ten en cuenta que si bloqueas las cookies técnicas, es posible que no puedas iniciar sesión en tu cuenta de voluntario.
          </p>
        </section>

        <div className="mt-8 pt-6 border-t-4 border-pokeDark text-center font-bold">
          <p>Si tienes dudas sobre el uso de cookies, contáctanos en nuestro <Link to="/soporte" className="text-pokeBlue hover:underline">Centro de Ayuda</Link>.</p>
        </div>

      </div>

    </div>
  );
}

export default Cookies;