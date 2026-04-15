import { Link } from 'react-router-dom';

function Terminos() {
  return (
    <div>
      <div className="bg-gradient-to-b from-pokeRed/10 to-transparent">
        <div className="container mx-auto px-4 pt-8 sm:pt-12 pb-6 max-w-3xl text-center">
          <h1 className="text-2xl sm:text-4xl font-retro text-pokeDark mb-3">Términos de Uso</h1>
          <p className="text-gray-500 font-bold">Última actualización: Abril 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-3xl">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5 sm:p-8 space-y-6 text-gray-600 font-semibold text-sm leading-relaxed">
          
          {[
            {
              titulo: '1. Aceptación de los Términos',
              contenido: 'Al acceder y utilizar la plataforma SaaS ShelterDex, aceptas estar legalmente vinculado por estos Términos de Uso. Si no estás de acuerdo con alguna parte, no podrás acceder a la plataforma ni utilizar sus servicios.'
            },
            {
              titulo: '2. Uso de la Plataforma',
              contenido: 'ShelterDex es una herramienta B2B diseñada para la gestión integral de protectoras de animales y la retención de voluntarios. El usuario se compromete a hacer un uso adecuado y lícito, evitando introducir virus, intentar accesos no autorizados o sobrecargar la infraestructura del servidor.'
            },
            {
              titulo: '3. Sistema de Gamificación',
              contenido: 'El sistema de niveles, logros y Puntos de Experiencia (XP) tiene un propósito exclusivamente lúdico y motivacional. Los puntos acumulados no tienen valor monetario, no son transferibles y no pueden ser canjeados por dinero real ni por bienes materiales.'
            },
            {
              titulo: '4. Propiedad Intelectual',
              contenido: 'Todo el código fuente, diseño gráfico, logotipos, textos y bases de datos de ShelterDex son propiedad exclusiva de Ismael González Tempa y están protegidos por las leyes de propiedad intelectual e industrial vigentes.'
            },
            {
              titulo: '5. Protección de Datos',
              contenido: 'El tratamiento de datos personales se rige por nuestra Política de Privacidad, conforme al Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD). Puedes ejercer tus derechos ARCO+ en cualquier momento.'
            },
            {
              titulo: '6. Limitación de Responsabilidad',
              contenido: 'ShelterDex se proporciona "tal cual". No garantizamos la disponibilidad ininterrumpida del servicio. No seremos responsables de daños derivados del uso inadecuado de la plataforma o de interrupciones por mantenimiento o causas de fuerza mayor.'
            },
          ].map((seccion, i) => (
            <section key={i}>
              <h2 className="font-retro text-pokeDark mb-2">{seccion.titulo}</h2>
              <p>{seccion.contenido}</p>
            </section>
          ))}

          <div className="pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-400">Para dudas legales: <Link to="/soporte" className="text-pokeRed hover:underline">Centro de Ayuda</Link>.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Terminos;