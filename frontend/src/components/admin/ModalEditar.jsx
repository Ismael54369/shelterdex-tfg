import SliderStat from './SliderStat';
import { urlImagen } from '../../config/api';

function ModalEditar({ abierto, animal, onCerrar, onEditar }) {
  if (!abierto || !animal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="poke-card p-6 bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b-4 border-pokeDark pb-4">
          <h2 className="text-2xl font-retro text-pokeBlue">Editar Ficha: {animal.nombre}</h2>
          <button onClick={onCerrar} className="text-3xl font-bold text-gray-500 hover:text-pokeRed">&times;</button>
        </div>
        
        <form onSubmit={onEditar} className="space-y-4 font-bold">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm uppercase mb-1">Nombre</label>
              <input type="text" name="nombre" defaultValue={animal.nombre} required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" />
            </div>
            <div>
              <label className="block text-sm uppercase mb-1">Estado</label>
              <select name="estado" defaultValue={animal.estado} className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight">
                <option value="Refugio">Refugio</option>
                <option value="Acogida">Acogida</option>
                <option value="Adoptado">Adoptado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm uppercase mb-1">Especie</label>
              <select name="especie" defaultValue={animal.especie} className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight">
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm uppercase mb-1">Edad</label>
              <input type="text" name="edad" defaultValue={animal.edad} required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" />
            </div>
            <div>
              <label className="block text-sm uppercase mb-1">Peso</label>
              <input type="text" name="peso" defaultValue={animal.peso} required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight" />
            </div>
          </div>

          {/* Estadísticas editables (Opción C: el admin puede ajustar manualmente) */}
          <div className="bg-pokeLight border-4 border-pokeDark rounded-lg p-4 space-y-4">
            <p className="text-xs uppercase text-pokeDark font-bold">Estadísticas del animal</p>
            <SliderStat nombre="Energía" campo="energia" valorInicial={animal.energia} color="bg-pokeYellow" icono="⚡" />
            <SliderStat nombre="Sociabilidad" campo="sociabilidad" valorInicial={animal.sociabilidad} color="bg-pokeBlue" icono="💙" />
            <p className="text-xs text-gray-500 italic">
              ℹ️ Estas estadísticas también se modifican automáticamente cuando un voluntario completa una tarea aprobada.
            </p>
          </div>
          <div className="col-span-full">
              <label className="block text-sm uppercase mb-1">Foto del Animal</label>
              {animal.imagen && (
                <div className="mb-2">
                  <img 
                    src={urlImagen(animal.imagen)} 
                    alt={animal.nombre}
                    className="w-24 h-24 object-cover rounded border-4 border-pokeDark"
                  />
                  <p className="text-xs text-gray-500 mt-1">Foto actual. Sube una nueva para reemplazarla.</p>
                </div>
              )}
              <input 
                type="file" 
                name="imagen" 
                accept="image/jpeg,image/png,image/webp"
                className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight file:mr-4 file:py-1 file:px-4 file:rounded file:border-2 file:border-pokeDark file:bg-pokeYellow file:font-bold file:text-pokeDark hover:file:bg-yellow-300"
              />
          </div>
          <div>
            <label className="block text-sm uppercase mb-1">Descripción</label>
            <textarea name="descripcion" defaultValue={animal.descripcion} rows="3" required className="w-full p-2 border-4 border-pokeDark rounded bg-pokeLight"></textarea>
          </div>

          <button type="submit" className="w-full bg-pokeBlue text-white font-retro py-4 rounded border-4 border-pokeDark hover:bg-white hover:text-pokeBlue hover:-translate-y-1 transition-all">
            Actualizar Ficha
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModalEditar;