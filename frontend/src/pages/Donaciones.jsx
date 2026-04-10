import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Donaciones() {
  const navigate = useNavigate();
  const [cantidad, setCantidad] = useState(10);
  const [procesando, setProcesando] = useState(false);
  const [metodoPago, setMetodoPago] = useState('tarjeta'); // Opciones: 'tarjeta', 'bizum', 'paypal'
  
  // Estados para Tarjeta
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [caducidad, setCaducidad] = useState('');
  const [cvc, setCvc] = useState('');
  
  // Estados para Bizum
  const [telefonoBizum, setTelefonoBizum] = useState('');
  
  const [errores, setErrores] = useState({});

  // Validaciones
  const validarLuhn = (numero) => {
    let suma = 0;
    let alternar = false;
    for (let i = numero.length - 1; i >= 0; i--) {
      let digito = parseInt(numero.charAt(i), 10);
      if (alternar) {
        digito *= 2;
        if (digito > 9) digito -= 9;
      }
      suma += digito;
      alternar = !alternar;
    }
    return (suma % 10 === 0);
  };

  const validarCaducidad = (fecha) => {
    if (!/^\d{2}\/\d{2}$/.test(fecha)) return false;
    const [mes, anio] = fecha.split('/');
    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt('20' + anio, 10);
    if (mesNum < 1 || mesNum > 12) return false;
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();
    if (anioNum < anioActual) return false;
    if (anioNum === anioActual && mesNum < mesActual) return false;
    return true;
  };

  // Manejador principal de pago
  const handlePago = (e) => {
    e.preventDefault();
    const nuevosErrores = {};

    if (metodoPago === 'tarjeta') {
      const tarjetaLimpia = numeroTarjeta.replace(/\s+/g, '');
      if (!/^\d{13,19}$/.test(tarjetaLimpia) || !validarLuhn(tarjetaLimpia)) {
        nuevosErrores.tarjeta = 'Número de tarjeta inválido.';
      }
      if (!validarCaducidad(caducidad)) {
        nuevosErrores.caducidad = 'Fecha caducada o incorrecta.';
      }
      if (!/^\d{3,4}$/.test(cvc)) {
        nuevosErrores.cvc = 'CVC inválido.';
      }
    } else if (metodoPago === 'bizum') {
      // Validación de teléfono móvil en España (empieza por 6 o 7 y tiene 9 dígitos)
      const telefonoLimpio = telefonoBizum.replace(/\s+/g, '');
      if (!/^[67]\d{8}$/.test(telefonoLimpio)) {
        nuevosErrores.bizum = 'Debe ser un móvil español válido (9 dígitos, empezando por 6 o 7).';
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      toast.error('Revisa los datos introducidos.');
      return;
    }

    setErrores({});
    setProcesando(true);

    setTimeout(() => {
      setProcesando(false);
      let mensaje = '';
      if (metodoPago === 'tarjeta') mensaje = `Pago de ${cantidad}€ procesado por tarjeta.`;
      if (metodoPago === 'bizum') mensaje = `Solicitud de ${cantidad}€ enviada a tu Bizum.`;
      if (metodoPago === 'paypal') mensaje = `Redirigiendo a PayPal para pago de ${cantidad}€...`;
      
      toast.success(mensaje);
      navigate('/');
    }, 2000);
  };

  // Cambio de método de pago (limpia errores previos)
  const cambiarMetodo = (metodo) => {
    setMetodoPago(metodo);
    setErrores({});
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-retro text-pokeRed mb-4 drop-shadow-[2px_2px_0px_#222224]">Apoya al Refugio</h1>
        <p className="text-lg font-bold text-gray-700">Tu aportación es vital para mantener nuestras instalaciones operativas.</p>
      </div>

      <div className="poke-card p-6 md:p-10 bg-white grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Columna Izquierda: Cantidad */}
        <div>
          <h2 className="text-xl font-retro text-pokeDark mb-4">1. Importe a donar</h2>
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
            <label className="block text-pokeDark mb-2 font-bold text-sm uppercase">Importe personalizado (€)</label>
            <input 
              type="number" 
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full p-3 font-bold border-4 border-pokeDark rounded bg-pokeLight focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Columna Derecha: Método de pago */}
        <div>
          <h2 className="text-xl font-retro text-pokeDark mb-4">2. Método de pago</h2>
          
          {/* Sistema de Pestañas */}
          <div className="flex border-b-4 border-pokeDark mb-6">
            <button 
              type="button"
              onClick={() => cambiarMetodo('tarjeta')}
              className={`flex-1 font-bold py-2 px-1 text-sm md:text-base border-t-4 border-l-4 border-r-2 rounded-tl border-pokeDark transition-colors ${metodoPago === 'tarjeta' ? 'bg-pokeDark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              Tarjeta
            </button>
            <button 
              type="button"
              onClick={() => cambiarMetodo('bizum')}
              className={`flex-1 font-bold py-2 px-1 text-sm md:text-base border-t-4 border-x-2 border-pokeDark transition-colors ${metodoPago === 'bizum' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              Bizum
            </button>
            <button 
              type="button"
              onClick={() => cambiarMetodo('paypal')}
              className={`flex-1 font-bold py-2 px-1 text-sm md:text-base border-t-4 border-r-4 border-l-2 rounded-tr border-pokeDark transition-colors ${metodoPago === 'paypal' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              PayPal
            </button>
          </div>

          <form onSubmit={handlePago} className="font-bold">
            
            {/* Formulario Tarjeta */}
            {metodoPago === 'tarjeta' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-pokeDark mb-1 text-sm uppercase">Número de tarjeta</label>
                  <input 
                    type="text" 
                    value={numeroTarjeta}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                      setNumeroTarjeta(val.match(/.{1,4}/g)?.join(' ') || val);
                    }}
                    placeholder="0000 0000 0000 0000"
                    maxLength="19"
                    required
                    className={`w-full p-2 border-4 rounded bg-pokeLight focus:bg-white focus:outline-none ${errores.tarjeta ? 'border-red-500' : 'border-pokeDark'}`}
                  />
                  {errores.tarjeta && <p className="text-red-500 text-xs mt-1">{errores.tarjeta}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-pokeDark mb-1 text-sm uppercase">Caducidad</label>
                    <input 
                      type="text" 
                      value={caducidad}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                        setCaducidad(val);
                      }}
                      placeholder="MM/AA"
                      maxLength="5"
                      required
                      className={`w-full p-2 border-4 rounded bg-pokeLight focus:bg-white focus:outline-none text-center ${errores.caducidad ? 'border-red-500' : 'border-pokeDark'}`}
                    />
                    {errores.caducidad && <p className="text-red-500 text-xs mt-1">{errores.caducidad}</p>}
                  </div>
                  <div>
                    <label className="block text-pokeDark mb-1 text-sm uppercase">CVC</label>
                    <input 
                      type="text" 
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength="4"
                      required
                      className={`w-full p-2 border-4 rounded bg-pokeLight focus:bg-white focus:outline-none text-center ${errores.cvc ? 'border-red-500' : 'border-pokeDark'}`}
                    />
                    {errores.cvc && <p className="text-red-500 text-xs mt-1">{errores.cvc}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Formulario Bizum */}
            {metodoPago === 'bizum' && (
              <div className="space-y-4 animate-fade-in text-center p-4">
                <p className="text-gray-600 text-sm mb-4">Introduce el número de teléfono asociado a tu cuenta de Bizum. Recibirás una notificación en tu app bancaria para autorizar el pago.</p>
                <div className="text-left">
                  <label className="block text-pokeDark mb-1 text-sm uppercase">Número de teléfono</label>
                  <div className="flex">
                    <span className="bg-gray-200 border-4 border-r-0 border-pokeDark p-2 rounded-l text-gray-600">+34</span>
                    <input 
                      type="text" 
                      value={telefonoBizum}
                      onChange={(e) => setTelefonoBizum(e.target.value.replace(/\D/g, ''))}
                      placeholder="600 000 000"
                      maxLength="9"
                      required
                      className={`w-full p-2 border-4 rounded-r bg-pokeLight focus:bg-white focus:outline-none tracking-widest ${errores.bizum ? 'border-red-500' : 'border-pokeDark'}`}
                    />
                  </div>
                  {errores.bizum && <p className="text-red-500 text-xs mt-1">{errores.bizum}</p>}
                </div>
              </div>
            )}

            {/* Formulario PayPal */}
            {metodoPago === 'paypal' && (
              <div className="space-y-4 animate-fade-in text-center p-4">
                <p className="text-gray-600 text-sm mb-4">Al proceder, serás redirigido a la pasarela segura de PayPal para completar tu donación utilizando tu saldo o tarjetas vinculadas.</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={procesando}
              className={`w-full mt-8 font-retro py-4 rounded border-4 border-pokeDark transition-all ${
                procesando 
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                  : metodoPago === 'bizum' ? 'bg-blue-900 text-white hover:bg-white hover:text-blue-900' 
                  : metodoPago === 'paypal' ? 'bg-blue-500 text-white hover:bg-white hover:text-blue-500'
                  : 'bg-green-500 text-white hover:bg-white hover:text-green-500 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#222224]'
              }`}
            >
              {procesando ? 'Procesando...' : `Confirmar y donar ${cantidad}€`}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Donaciones;