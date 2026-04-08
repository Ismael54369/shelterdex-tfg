import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Donaciones() {
  const [cantidad, setCantidad] = useState(10); // 10€ por defecto
  const [procesando, setProcesando] = useState(false);
  const navigate = useNavigate();

  const handlePago = (e) => {
    e.preventDefault();
    setProcesando(true);

    // Simulamos que el pago tarda 2 segundos en procesarse (como en la vida real)
    setTimeout(() => {
      setProcesando(false);
      toast.success(`¡Gracias por tu donación de ${cantidad}€! Los peludos te lo agradecen.`, {
        icon: '💖',
        duration: 5000,
      });
      // Devolvemos al usuario a la página principal tras donar
      navigate('/');
    }, 2000);
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-6">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-retro text-pokeRed mb-4 drop-shadow-[2px_2px_0px_#222224]">Apoya al Refugio</h1>
        <p className="text-lg font-bold text-gray-700">Tu aportación nos ayuda a comprar comida, medicinas y juguetes.</p>
      </div>

      <div className="poke-card p-6 md:p-10 bg-white grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Columna Izquierda: Selección de Cantidad */}
        <div>
          <h2 className="text-xl font-retro text-pokeDark mb-4">Selecciona tu ayuda</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[5, 10, 20, 50].map((valor) => (
              <button 
                key={valor}
                type="button"
                onClick={() => setCantidad(valor)}
                className={`font-retro py-3 rounded border-4 transition-all ${
                  cantidad === valor 
                    ? 'bg-pokeYellow border-pokeDark text-pokeDark shadow-[inset_3px_3px_0px_rgba(0,0,0,0.1)]' 
                    : 'bg-pokeLight border-gray-300 text-gray-500 hover:border-pokeDark hover:text-pokeDark'
                }`}
              >
                {valor}€
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-pokeDark mb-2 font-bold text-sm uppercase">Otra cantidad (€)</label>
            <input 
              type="number" 
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full p-3 font-bold border-4 border-pokeDark rounded bg-pokeLight focus:bg-white focus:outline-none focus:border-pokeBlue"
            />
          </div>

          <div className="bg-blue-50 p-4 border-2 border-pokeBlue rounded-lg text-sm font-bold text-pokeBlue">
            <p>ℹ️ Pagos seguros mediante cifrado SSL de 256 bits.</p>
          </div>
        </div>

        {/* Columna Derecha: Datos de la Tarjeta (Simulado) */}
        <div>
          <h2 className="text-xl font-retro text-pokeDark mb-4">Datos de Pago</h2>
          
          <form onSubmit={handlePago} className="space-y-4 font-bold">
            <div>
              <label className="block text-pokeDark mb-1 text-sm uppercase">Titular de la tarjeta</label>
              <input 
                type="text" 
                placeholder="Nombre completo"
                required
                className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-pokeDark mb-1 text-sm uppercase">Número de la tarjeta</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000"
                  maxLength="16"
                  required
                  className="w-full p-2 pl-10 border-4 border-pokeDark rounded bg-pokeLight focus:bg-white focus:outline-none tracking-widest"
                />
                <span className="absolute left-3 top-2.5">💳</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-pokeDark mb-1 text-sm uppercase">Caducidad</label>
                <input 
                  type="text" 
                  placeholder="MM/AA"
                  maxLength="5"
                  required
                  className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight focus:bg-white focus:outline-none text-center"
                />
              </div>
              <div>
                <label className="block text-pokeDark mb-1 text-sm uppercase">CVC</label>
                <input 
                  type="text" 
                  placeholder="123"
                  maxLength="3"
                  required
                  className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight focus:bg-white focus:outline-none text-center"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={procesando}
              className={`w-full mt-4 font-retro py-4 rounded border-4 border-pokeDark transition-all flex items-center justify-center gap-2 ${
                procesando 
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-white hover:text-green-500 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#222224]'
              }`}
            >
              {procesando ? (
                <>
                  <span className="animate-spin text-xl">⏳</span> Procesando...
                </>
              ) : (
                `Donar ${cantidad}€`
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}

export default Donaciones;