import { Link } from 'react-router-dom';

function Faq() {
  const preguntas = [
    {
      pregunta: "¿Qué es ShelterDex?",
      respuesta: "Es una plataforma SaaS diseñada para protectoras de animales. Combina un panel de gestión interno (ERP) con un sistema gamificado para fidelizar a los voluntarios."
    },
    {
      pregunta: "¿Cómo funciona el sistema de niveles (XP)?",
      respuesta: "Cada vez que realizas una tarea como voluntario (pasear a un perro, limpiar, cepillar), el administrador la valida y recibes Puntos de Experiencia (XP). Al acumular XP, subes de nivel y mejoras tu perfil."
    },
    {
      pregunta: "¿Cualquier persona puede adoptar?",
      respuesta: "Sí, el catálogo de adopciones es público. Sin embargo, el proceso de adopción final requiere una entrevista presencial con la protectora para asegurar el bienestar del animal."
    },
    {
      pregunta: "¿Cómo me registro como voluntario?",
      respuesta: "El registro de voluntarios lo gestiona directamente el administrador de tu refugio. Contacta con ellos para que te den de alta en el sistema y te proporcionen tus credenciales de acceso."
    }
  ];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      
      <div className="text-center mb-10 mt-6">
        <h1 className="text-3xl font-retro text-pokeRed mb-4">Preguntas Frecuentes (FAQ)</h1>
        <p className="text-lg font-bold text-gray-700">Resuelve tus dudas sobre el uso de la plataforma.</p>
      </div>

      <div className="space-y-6">
        {preguntas.map((item, index) => (
          <div key={index} className="poke-card p-6">
            <h2 className="text-xl font-retro text-pokeDark mb-3 flex items-center gap-3">
              <span className="text-pokeYellow text-2xl">?</span>
              {item.pregunta}
            </h2>
            <p className="font-bold text-gray-600 ml-8 leading-relaxed">
              {item.respuesta}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center font-bold">
        <p className="mb-4">¿No has encontrado lo que buscabas?</p>
        <Link to="/soporte" className="text-pokeBlue hover:text-pokeRed transition-colors underline">
          Contacta con Atención al Cliente
        </Link>
      </div>

    </div>
  );
}

export default Faq;