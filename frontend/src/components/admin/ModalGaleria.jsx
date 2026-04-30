import { urlImagen } from '../../config/api';

function ModalGaleria({ abierto, animal, imagenes, onCerrar, onSubir, onEstablecerPortada, onBorrar, subiendo }) {
  if (!abierto || !animal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="poke-card p-4 sm:p-6 bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-6 border-b-4 border-pokeDark pb-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-retro text-purple-600">Galería: {animal.nombre}</h2>
            <p className="text-sm text-gray-500 font-bold">{imagenes.length} foto(s)</p>
          </div>
          <button onClick={onCerrar} className="text-3xl font-bold text-gray-500 hover:text-pokeRed">&times;</button>
        </div>

        {/* Subir imágenes */}
        <div className="mb-6 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <label className="block text-sm font-bold uppercase text-purple-700 mb-2">Subir nuevas fotos (máx. 5 a la vez)</label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={onSubir}
            disabled={subiendo}
            className="w-full p-2 border-4 border-pokeDark rounded bg-white font-bold text-sm file:mr-4 file:py-1 file:px-4 file:rounded file:border-2 file:border-pokeDark file:bg-pokeYellow file:font-bold file:text-pokeDark hover:file:bg-yellow-300 disabled:opacity-50"
          />
          {subiendo && <p className="text-sm text-purple-600 font-bold mt-2">Subiendo...</p>}
        </div>

        {/* Grid de imágenes */}
        {imagenes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📷</p>
            <p className="text-gray-500 font-bold">Este animal aún no tiene fotos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imagenes.map((img) => (
              <div key={img.id} className={`relative group rounded-lg overflow-hidden border-4 ${img.es_portada ? 'border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'border-gray-300'}`}>
                <img
                  src={urlImagen(img.ruta)}
                  alt={`Foto de ${animal.nombre}`}
                  className="w-full h-32 sm:h-40 object-cover"
                />
                
                {/* Badge de portada */}
                {img.es_portada && (
                  <span className="absolute top-2 left-2 bg-yellow-400 text-pokeDark text-xs font-bold px-2 py-1 rounded border-2 border-pokeDark">
                    ⭐ Portada
                  </span>
                )}

                {/* Botones de acción (aparecen al hacer hover) */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.es_portada && (
                    <button
                      onClick={() => onEstablecerPortada(img.id)}
                      className="bg-yellow-400 text-pokeDark font-bold text-xs px-3 py-2 rounded border-2 border-pokeDark hover:bg-yellow-300"
                    >
                      ⭐ Portada
                    </button>
                  )}
                  <button
                    onClick={() => onBorrar(img.id)}
                    className="bg-red-500 text-white font-bold text-xs px-3 py-2 rounded border-2 border-red-700 hover:bg-red-600"
                  >
                    🗑️ Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default ModalGaleria;