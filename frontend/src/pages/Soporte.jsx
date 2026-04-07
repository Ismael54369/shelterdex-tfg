import { useState } from 'react';

function Soporte() {
  const [mensajeEnviado, setMensajeEnviado] = useState(false);

  const enviarTicket = (e) => {
    e.preventDefault(); // Evita que la web se recargue
    setMensajeEnviado(true);
    
    // Ocultamos el mensaje de éxito después de 5 segundos
    setTimeout(() => {
      setMensajeEnviado(false);
    }, 5000);
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      
      <div className="text-center mb-10 mt-6">
        <h1 className="text-3xl font-retro text-pokeRed mb-4">Centro de Ayuda</h1>
        <p className="text-lg font-bold text-gray-700">
          ¿Problemas con el sistema? Nuestro equipo está listo para asistirte.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Columna Izquierda: Información de Contacto */}
        <div className="poke-card p-6 bg-pokeBlue text-white relative overflow-hidden">
          <h2 className="text-xl font-retro text-pokeYellow mb-6 drop-shadow-[2px_2px_0px_#222224]">
            Contacto Directo
          </h2>
          
          <div className="space-y-6 font-bold text-lg">
            <div className="flex items-center gap-4">
              <span className="text-3xl bg-white text-pokeDark w-12 h-12 flex items-center justify-center rounded-full border-4 border-pokeDark shadow-[2px_2px_0px_0px_#222224]">
                📞
              </span>
              <div>
                <p className="text-sm text-pokeLight uppercase">Teléfono Gratuito</p>
                <p className="tracking-wider">+34 900 123 456</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl bg-white text-pokeDark w-12 h-12 flex items-center justify-center rounded-full border-4 border-pokeDark shadow-[2px_2px_0px_0px_#222224]">
                ✉️
              </span>
              <div>
                <p className="text-sm text-pokeLight uppercase">Correo Electrónico</p>
                <p className="tracking-wider">ayuda@shelterdex.es</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl bg-white text-pokeDark w-12 h-12 flex items-center justify-center rounded-full border-4 border-pokeDark shadow-[2px_2px_0px_0px_#222224]">
                ⏰
              </span>
              <div>
                <p className="text-sm text-pokeLight uppercase">Horario de Atención</p>
                <p className="tracking-wider">Lunes a Viernes, 09:00 - 18:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Incidencias */}
        <div className="poke-card p-6">
          <h2 className="text-xl font-retro text-pokeDark mb-6">Enviar Ticket</h2>
          
          {mensajeEnviado ? (
            <div className="bg-green-100 border-4 border-green-500 text-green-800 p-6 rounded-lg text-center font-bold">
              <p className="text-3xl mb-2">✅</p>
              <p>¡Incidencia recibida correctamente!</p>
              <p className="text-sm mt-2 font-normal">Te responderemos a tu correo en un plazo máximo de 24 horas.</p>
            </div>
          ) : (
            <form onSubmit={enviarTicket} className="space-y-4 font-bold">
              
              <div>
                <label className="block text-pokeDark mb-1 text-sm uppercase">Tu Nombre / Refugio</label>
                <input 
                  type="text" 
                  className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight focus:bg-white focus:outline-none transition-colors"
                  placeholder="Ej: Refugio La Esperanza"
                  required
                />
              </div>

              <div>
                <label className="block text-pokeDark mb-1 text-sm uppercase">Correo de contacto</label>
                <input 
                  type="email" 
                  className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight focus:bg-white focus:outline-none transition-colors"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-pokeDark mb-1 text-sm uppercase">Describe la incidencia</label>
                <textarea 
                  className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight focus:bg-white focus:outline-none transition-colors"
                  rows="4"
                  placeholder="Explica detalladamente tu problema..."
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-pokeRed text-white font-retro py-3 rounded border-4 border-pokeDark hover:bg-pokeYellow hover:text-pokeDark transition-colors"
              >
                Enviar Mensaje
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export default Soporte;