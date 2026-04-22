import { useState } from 'react';

function Soporte() {
  const [enviado, setEnviado] = useState(false);

  const enviarTicket = (e) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => setEnviado(false), 5000);
  };

  return (
    <div>
      <div className="bg-gradient-to-b from-pokeBlue/10 to-transparent">
        <div className="container mx-auto px-4 pt-8 sm:pt-12 pb-6 max-w-4xl text-center">
          <h1 className="text-2xl sm:text-4xl font-retro text-pokeDark mb-3">Centro de Ayuda</h1>
          <p className="text-gray-500 font-bold">¿Problemas con el sistema? Estamos aquí para ayudarte.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Info de contacto */}
          <div className="lg:col-span-2 bg-pokeDark rounded-xl p-5 sm:p-6 text-white">
            <h2 className="font-retro text-pokeYellow mb-6">Contacto Directo</h2>
            <div className="space-y-5">
              {[
                { icono: '📞', label: 'Teléfono', valor: '+34 900 123 456' },
                { icono: '✉️', label: 'Email', valor: 'ayuda@shelterdex.es' },
                { icono: '⏰', label: 'Horario', valor: 'L-V, 09:00 - 18:00' },
                { icono: '📍', label: 'Ubicación', valor: 'Málaga, España' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-2xl w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">{item.icono}</span>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">{item.label}</p>
                    <p className="font-bold text-sm">{item.valor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-3 bg-white border-2 border-gray-200 rounded-xl p-5 sm:p-6">
            <h2 className="font-retro text-pokeDark mb-5">Enviar Ticket</h2>
            
            {enviado ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-bold text-green-700 mb-1">¡Incidencia recibida!</p>
                <p className="text-sm text-gray-500 font-bold">Te responderemos en un plazo máximo de 24 horas.</p>
              </div>
            ) : (
              <form onSubmit={enviarTicket} className="space-y-4 font-bold text-sm">
                <div>
                  <label className="block text-gray-500 mb-1 text-xs uppercase">Nombre / Refugio</label>
                  <input type="text" required placeholder="Ej: Refugio La Esperanza" className="w-full p-3 border-4 border-gray-200 rounded-lg focus:border-pokeDark focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-xs uppercase">Email de contacto</label>
                  <input type="email" required placeholder="ejemplo@correo.com" className="w-full p-3 border-4 border-gray-200 rounded-lg focus:border-pokeDark focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-xs uppercase">Describe la incidencia</label>
                  <textarea rows="4" required placeholder="Explica detalladamente tu problema..." className="w-full p-3 border-4 border-gray-200 rounded-lg focus:border-pokeDark focus:outline-none transition-colors"></textarea>
                </div>
                <button type="submit" className="w-full bg-pokeRed text-white font-retro py-2.5 rounded-lg border-4 border-pokeDark hover:bg-pokeYellow hover:text-pokeDark hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_#222224] transition-all text-xs sm:text-sm">
                  Enviar Mensaje
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Soporte;