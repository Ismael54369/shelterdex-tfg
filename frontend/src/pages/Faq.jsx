import { useState } from 'react';
import { Link } from 'react-router-dom';

function Faq() {
  const [abierta, setAbierta] = useState(null);

  const preguntas = [
    { pregunta: "¿Qué es ShelterDex?", respuesta: "Es una plataforma SaaS diseñada para protectoras de animales. Combina un panel de gestión interno (ERP) con un sistema gamificado para fidelizar a los voluntarios mediante niveles, XP y rankings." },
    { pregunta: "¿Cómo funciona el sistema de niveles (XP)?", respuesta: "Cada vez que realizas una tarea como voluntario (pasear, alimentar, limpiar), el administrador la valida y recibes Puntos de Experiencia (XP). La progresión sigue una curva exponencial: los primeros niveles son fáciles, pero los altos requieren mucho más esfuerzo." },
    { pregunta: "¿Cualquier persona puede adoptar?", respuesta: "Sí, el catálogo de adopciones es público. Cualquier persona puede enviar una solicitud de adopción desde la ficha del animal. El administrador del refugio revisará cada solicitud y se pondrá en contacto contigo." },
    { pregunta: "¿Cómo me registro como voluntario?", respuesta: "Puedes crear tu cuenta directamente desde la página de inicio de sesión. Solo necesitas un email y una contraseña segura (mínimo 8 caracteres con letras y números)." },
    { pregunta: "¿Los puntos XP tienen valor monetario?", respuesta: "No. El sistema de gamificación es exclusivamente motivacional. Los puntos no son canjeables por dinero, bienes ni servicios. Su único propósito es fomentar la participación activa de los voluntarios." },
    { pregunta: "¿Mis datos están seguros?", respuesta: "Sí. Utilizamos cifrado SSL, autenticación JWT con tokens de 24h, y las contraseñas se almacenan con bcrypt (hash + salt). No vendemos ni compartimos datos con terceros." },
  ];

  return (
    <div>
      <div className="bg-gradient-to-b from-pokeYellow/10 to-transparent">
        <div className="container mx-auto px-4 pt-8 sm:pt-12 pb-6 max-w-3xl text-center">
          <h1 className="text-2xl sm:text-4xl font-retro text-pokeDark mb-3">Preguntas Frecuentes</h1>
          <p className="text-gray-500 font-bold">Resuelve tus dudas sobre el uso de la plataforma.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-3xl">
        <div className="flex flex-col gap-3">
          {preguntas.map((item, index) => (
            <div key={index} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-pokeDark/30 transition-colors">
              <button
                onClick={() => setAbierta(abierta === index ? null : index)}
                className="w-full text-left p-4 sm:p-5 flex justify-between items-center gap-4"
              >
                <h2 className="font-bold text-pokeDark text-sm sm:text-base">{item.pregunta}</h2>
                <span className={`text-xl font-bold text-gray-400 flex-shrink-0 transition-transform ${abierta === index ? 'rotate-45' : ''}`}>+</span>
              </button>
              {abierta === index && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100">
                  <p className="text-gray-600 font-semibold text-sm leading-relaxed pt-3">{item.respuesta}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center bg-pokeDark rounded-xl p-6 sm:p-8">
          <p className="text-white font-bold mb-3">¿No has encontrado lo que buscabas?</p>
          <Link to="/soporte" className="bg-pokeYellow text-pokeDark font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg border-2 border-pokeDark hover:bg-yellow-300 transition-colors inline-block">
            Contactar con Soporte
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Faq;