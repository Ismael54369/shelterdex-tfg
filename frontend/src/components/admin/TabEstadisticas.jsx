import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function TabEstadisticas({ estadisticas }) {
  if (!estadisticas) return null;

  return (
    <div className="flex flex-col gap-6">

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Animales</p>
          <p className="text-xl sm:text-3xl font-retro text-pokeBlue">
            {estadisticas.animalesPorEstado.reduce((sum, e) => sum + e.total, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-red-200 hover:border-red-400 transition-colors">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Voluntarios</p>
          <p className="text-xl sm:text-3xl font-retro text-pokeRed">{estadisticas.totalVoluntarios}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-green-200 hover:border-green-400 transition-colors">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Aprobadas</p>
          <p className="text-xl sm:text-3xl font-retro text-green-600">
            {estadisticas.tareasPorEstado.find(t => t.estado === 'aprobada')?.total || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-yellow-200 hover:border-yellow-400 transition-colors">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pendientes</p>
          <p className="text-xl sm:text-3xl font-retro text-yellow-500">
            {estadisticas.tareasPorEstado.find(t => t.estado === 'pendiente')?.total || 0}
          </p>
        </div>
      </div>

      {/* FILA DE GRÁFICOS: Tarta + Barras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico de Tarta: Animales por estado */}
        <div className="poke-card p-3 sm:p-6">
          <h3 className="font-retro text-sm sm:text-base text-pokeDark mb-4 text-center">Animales por Estado</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={estadisticas.animalesPorEstado.map(e => ({ name: e.estado, value: e.total }))}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                strokeWidth={3}
                stroke="#222224"
              >
                {estadisticas.animalesPorEstado.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={['#3B82F6', '#F59E0B', '#10B981'][index % 3]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras: Ranking de Voluntarios */}
        <div className="poke-card p-6">
          <h3 className="font-retro text-pokeDark mb-4 text-center">Ranking de Voluntarios (XP)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={estadisticas.rankingVoluntarios} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="nombre" width={120} tick={{ fontSize: 12, fontWeight: 'bold' }} />
              <Tooltip 
                formatter={(value) => [`${value} XP`, 'Experiencia']}
              />
              <Bar dataKey="xp" radius={[0, 8, 8, 0]} strokeWidth={2} stroke="#222224">
                {estadisticas.rankingVoluntarios.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={index === 0 ? '#EE1515' : index === 1 ? '#3B82F6' : '#9CA3AF'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Barras: Tareas más populares (ancho completo) */}
      <div className="poke-card p-6">
        <h3 className="font-retro text-pokeDark mb-4 text-center">Tareas Más Solicitadas</h3>
        {estadisticas.tareasPopulares.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={estadisticas.tareasPopulares}>
              <XAxis dataKey="nombre" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [`${value} veces`, 'Solicitudes']} />
              <Bar dataKey="total" fill="#3B82F6" radius={[8, 8, 0, 0]} strokeWidth={2} stroke="#222224" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 font-bold py-8">Aún no hay tareas registradas.</p>
        )}
      </div>

    </div>
  );
}

export default TabEstadisticas;