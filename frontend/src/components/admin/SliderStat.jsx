import { useState } from 'react';

// Componente auxiliar: slider de estadística 0-100 con valor visible.
// Declarado fuera del componente padre para evitar re-crearlo en cada render
// (si se recreara, el slider perdería el foco y el estado local al teclear).
function SliderStat({ nombre, campo, valorInicial, color, icono }) {
  const [valor, setValor] = useState(Number(valorInicial) || 50);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm uppercase font-bold text-pokeDark">
          {icono} {nombre}
        </label>
        <span className="font-retro text-pokeDark text-sm">{valor}/100</span>
      </div>
      <input
        type="range"
        name={campo}
        min="0"
        max="100"
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
        className="w-full h-2 accent-pokeDark cursor-pointer"
      />
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden border-2 border-pokeDark">
        <div className={`${color} h-full transition-all`} style={{ width: `${valor}%` }}></div>
      </div>
    </div>
  );
}

export default SliderStat;