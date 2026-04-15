import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Donaciones() {
  const navigate = useNavigate();
  const [cantidad, setCantidad] = useState(10);
  const [procesando, setProcesando] = useState(false);
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [caducidad, setCaducidad] = useState('');
  const [cvc, setCvc] = useState('');
  const [telefonoBizum, setTelefonoBizum] = useState('');
  const [errores, setErrores] = useState({});

  const validarLuhn = (numero) => {
    let suma = 0, alternar = false;
    for (let i = numero.length - 1; i >= 0; i--) {
      let digito = parseInt(numero.charAt(i), 10);
      if (alternar) { digito *= 2; if (digito > 9) digito -= 9; }
      suma += digito; alternar = !alternar;
    }
    return (suma % 10 === 0);
  };

  const validarCaducidad = (fecha) => {
    if (!/^\d{2}\/\d{2}$/.test(fecha)) return false;
    const [mes, anio] = fecha.split('/');
    const mesNum = parseInt(mes, 10), anioNum = parseInt('20' + anio, 10);
    if (mesNum < 1 || mesNum > 12) return false;
    const hoy = new Date();
    if (anioNum < hoy.getFullYear()) return false;
    if (anioNum === hoy.getFullYear() && mesNum < hoy.getMonth() + 1) return false;
    return true;
  };

  const handlePago = (e) => {
    e.preventDefault();
    const nuevosErrores = {};
    if (metodoPago === 'tarjeta') {
      const tarjetaLimpia = numeroTarjeta.replace(/\s+/g, '');
      if (!/^\d{13,19}$/.test(tarjetaLimpia) || !validarLuhn(tarjetaLimpia)) nuevosErrores.tarjeta = 'Número de tarjeta inválido.';
      if (!validarCaducidad(caducidad)) nuevosErrores.caducidad = 'Fecha caducada o incorrecta.';
      if (!/^\d{3,4}$/.test(cvc)) nuevosErrores.cvc = 'CVC inválido.';
    } else if (metodoPago === 'bizum') {
      const telefonoLimpio = telefonoBizum.replace(/\s+/g, '');
      if (!/^[67]\d{8}$/.test(telefonoLimpio)) nuevosErrores.bizum = 'Debe ser un móvil español válido (9 dígitos, empezando por 6 o 7).';
    }
    if (Object.keys(nuevosErrores).length > 0) { setErrores(nuevosErrores); toast.error('Revisa los datos introducidos.'); return; }
    setErrores({}); setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      let mensaje = '';
      if (metodoPago === 'tarjeta') mensaje = `Pago de ${cantidad}€ procesado por tarjeta.`;
      if (metodoPago === 'bizum') mensaje = `Solicitud de ${cantidad}€ enviada a tu Bizum.`;
      if (metodoPago === 'paypal') mensaje = `Redirigiendo a PayPal para pago de ${cantidad}€...`;
      toast.success(mensaje); navigate('/');
    }, 2000);
  };

  const cambiarMetodo = (metodo) => { setMetodoPago(metodo); setErrores({}); };

  return (
    <div>
      {/* Cabecera */}
      <div className="bg-gradient-to-b from-green-500/10 to-transparent">
        <div className="container mx-auto px-4 pt-8 sm:pt-12 pb-6 max-w-4xl text-center">
          <div className="bg-green-100 text-green-700 font-bold text-xs sm:text-sm px-4 py-2 rounded-full border-2 border-green-300 mb-4 inline-block uppercase tracking-wider">
            💚 Donación 100% segura
          </div>
          <h1 className="text-2xl sm:text-4xl font-retro text-pokeDark mb-3">Apoya al Refugio</h1>
          <p className="text-gray-500 font-bold max-w-lg mx-auto">Tu aportación mantiene las instalaciones operativas y garantiza el bienestar de cada animal.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl pb-12">
        <div className="bg-white border-4 border-pokeDark rounded-xl p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_0px_#222224] grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          
          {/* Columna Izquierda: Cantidad */}
          <div>
            <h2 className="font-retro text-pokeDark mb-4 flex items-center gap-2">
              <span className="bg-pokeDark text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">1</span>
              Importe a donar
            </h2>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {[5, 10, 20, 50].map((valor) => (
                <button 
                  key={valor} type="button"
                  onClick={() => setCantidad(valor)}
                  className={`font-retro text-sm sm:text-base py-3 rounded-lg border-2 transition-all ${
                    cantidad === valor 
                      ? 'bg-green-500 border-green-600 text-white shadow-[inset_2px_2px_0px_rgba(0,0,0,0.15)]' 
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600'
                  }`}
                >
                  {valor}€
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-gray-500 mb-2 font-bold text-xs uppercase">O escribe otro importe</label>
              <div className="relative">
                <input 
                  type="number" min="1" value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-full p-3 pr-10 font-bold border-4 border-gray-200 rounded-lg bg-white focus:border-green-500 focus:outline-none text-lg"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 hidden lg:block">
              <p className="text-sm font-bold text-green-700 mb-2">Tu donación de {cantidad}€ ayudará a:</p>
              <div className="space-y-1 text-xs font-bold text-green-600">
                <p>🍖 Alimentar a los animales durante {Math.max(1, Math.floor(cantidad / 5))} día(s)</p>
                <p>💊 Cubrir gastos veterinarios básicos</p>
                <p>🏠 Mantener las instalaciones del refugio</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Método de pago */}
          <div>
            <h2 className="font-retro text-pokeDark mb-4 flex items-center gap-2">
              <span className="bg-pokeDark text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">2</span>
              Método de pago
            </h2>
            
            {/* Pestañas de método */}
            <div className="flex gap-2 mb-6">
              {[
                { id: 'tarjeta', label: '💳 Tarjeta', color: 'bg-pokeDark' },
                { id: 'bizum', label: '📱 Bizum', color: 'bg-blue-800' },
                { id: 'paypal', label: '🅿️ PayPal', color: 'bg-blue-500' },
              ].map((m) => (
                <button
                  key={m.id} type="button"
                  onClick={() => cambiarMetodo(m.id)}
                  className={`flex-1 font-bold py-2 text-xs sm:text-sm rounded-lg border-2 transition-all ${
                    metodoPago === m.id
                      ? `${m.color} text-white border-transparent shadow-md`
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <form onSubmit={handlePago} className="font-bold">
              
              {/* Formulario Tarjeta */}
              {metodoPago === 'tarjeta' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-500 mb-1 text-xs uppercase">Número de tarjeta</label>
                    <input type="text" value={numeroTarjeta}
                      onChange={(e) => { let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, ''); setNumeroTarjeta(val.match(/.{1,4}/g)?.join(' ') || val); }}
                      placeholder="0000 0000 0000 0000" maxLength="19" required
                      className={`w-full p-3 border-4 rounded-lg bg-white focus:outline-none transition-colors ${errores.tarjeta ? 'border-red-400' : 'border-gray-200 focus:border-pokeDark'}`}
                    />
                    {errores.tarjeta && <p className="text-red-500 text-xs mt-1">{errores.tarjeta}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-500 mb-1 text-xs uppercase">Caducidad</label>
                      <input type="text" value={caducidad}
                        onChange={(e) => { let val = e.target.value.replace(/\D/g, ''); if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4); setCaducidad(val); }}
                        placeholder="MM/AA" maxLength="5" required
                        className={`w-full p-3 border-4 rounded-lg bg-white focus:outline-none text-center transition-colors ${errores.caducidad ? 'border-red-400' : 'border-gray-200 focus:border-pokeDark'}`}
                      />
                      {errores.caducidad && <p className="text-red-500 text-xs mt-1">{errores.caducidad}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1 text-xs uppercase">CVC</label>
                      <input type="text" value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                        placeholder="123" maxLength="4" required
                        className={`w-full p-3 border-4 rounded-lg bg-white focus:outline-none text-center transition-colors ${errores.cvc ? 'border-red-400' : 'border-gray-200 focus:border-pokeDark'}`}
                      />
                      {errores.cvc && <p className="text-red-500 text-xs mt-1">{errores.cvc}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario Bizum */}
              {metodoPago === 'bizum' && (
                <div className="space-y-4">
                  <p className="text-gray-500 text-sm">Introduce tu número de Bizum. Recibirás una notificación en tu app bancaria.</p>
                  <div>
                    <label className="block text-gray-500 mb-1 text-xs uppercase">Número de teléfono</label>
                    <div className="flex">
                      <span className="bg-gray-100 border-4 border-r-0 border-gray-200 p-3 rounded-l-lg text-gray-500 font-bold">+34</span>
                      <input type="text" value={telefonoBizum}
                        onChange={(e) => setTelefonoBizum(e.target.value.replace(/\D/g, ''))}
                        placeholder="600 000 000" maxLength="9" required
                        className={`w-full p-3 border-4 rounded-r-lg bg-white focus:outline-none tracking-widest transition-colors ${errores.bizum ? 'border-red-400' : 'border-gray-200 focus:border-blue-800'}`}
                      />
                    </div>
                    {errores.bizum && <p className="text-red-500 text-xs mt-1">{errores.bizum}</p>}
                  </div>
                </div>
              )}

              {/* Formulario PayPal */}
              {metodoPago === 'paypal' && (
                <div className="text-center py-6">
                  <p className="text-4xl mb-3">🅿️</p>
                  <p className="text-gray-500 text-sm">Al confirmar, serás redirigido a la pasarela segura de PayPal.</p>
                </div>
              )}

              <button 
                type="submit" disabled={procesando}
                className={`w-full mt-6 font-retro py-4 rounded-lg border-4 transition-all text-sm sm:text-base ${
                  procesando ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' 
                  : 'bg-green-500 text-white border-green-600 hover:bg-green-600 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#222224]'
                }`}
              >
                {procesando ? 'Procesando...' : `Donar ${cantidad}€ con ${metodoPago === 'tarjeta' ? 'Tarjeta' : metodoPago === 'bizum' ? 'Bizum' : 'PayPal'}`}
              </button>

              {/* Badges de confianza */}
              <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400 font-bold">
                <span>🔒 Cifrado SSL</span>
                <span>🛡️ Datos seguros</span>
                <span>✅ Sin comisiones</span>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Donaciones;