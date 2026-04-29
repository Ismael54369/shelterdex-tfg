import SliderStat from './SliderStat';

function ModalCrear({ abierto, onCerrar, onCrear }) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="poke-card p-6 bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b-4 border-pokeDark pb-4">
          <h2 className="text-2xl font-retro text-pokeRed">Registrar Animal</h2>
          <button onClick={onCerrar} className="text-3xl font-bold text-gray-500 hover:text-pokeRed">&times;</button>
        </div>
        <form onSubmit={onCrear} className="space-y-4 font-bold">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm uppercase mb-1">Nombre</label><input type="text" name="nombre" required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" /></div>
            <div>
              <label className="block text-sm uppercase mb-1">Especie</label>
              <select name="especie" className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight">
                <option value="Perro">Perro</option><option value="Gato">Gato</option><option value="Otro">Otro</option>
              </select>
            </div>
            <div><label className="block text-sm uppercase mb-1">Edad</label><input type="text" name="edad" required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" /></div>
            <div><label className="block text-sm uppercase mb-1">Peso</label><input type="text" name="peso" required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" /></div>
            <div><label className="block text-sm uppercase mb-1">Emoji</label><input type="text" name="emoji" defaultValue="🐾" maxLength="2" className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight text-center text-xl" /></div>
          </div>

          {/* Estadísticas iniciales (Opción C: admin las ajusta al alta) */}
          <div className="bg-pokeLight border-4 border-pokeDark rounded-lg p-4 space-y-4">
            <p className="text-xs uppercase text-pokeDark font-bold">Estadísticas iniciales</p>
            <SliderStat nombre="Energía" campo="energia" valorInicial={50} color="bg-pokeYellow" icono="⚡" />
            <SliderStat nombre="Sociabilidad" campo="sociabilidad" valorInicial={50} color="bg-pokeBlue" icono="💙" />
          </div>
          <div className="col-span-full">
              <label className="block text-sm uppercase mb-1">Foto del Animal</label>
              <input 
                type="file" 
                name="imagen" 
                accept="image/jpeg,image/png,image/webp"
                className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight file:mr-4 file:py-1 file:px-4 file:rounded file:border-2 file:border-pokeDark file:bg-pokeYellow file:font-bold file:text-pokeDark hover:file:bg-yellow-300"
              />
              <p className="text-xs text-gray-500 mt-1">JPG, PNG o WebP. Máximo 5MB. (Opcional)</p>
          </div>
          <div><label className="block text-sm uppercase mb-1">Descripción</label><textarea name="descripcion" rows="3" required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight"></textarea></div>
          <button type="submit" className="w-full bg-pokeYellow text-pokeDark font-retro py-4 rounded border-4 border-pokeDark hover:bg-white hover:-translate-y-1 transition-all">Guardar</button>
        </form>
      </div>
    </div>
  );
}

export default ModalCrear;