import { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function GraficoPromedios({ kardex }) {
    const data = useMemo(() => {
        if (!kardex) return []

        const porSemestre = kardex.reduce((acc, m) => {
            const s = m.semestre ?? 0
            if (!acc[s]) acc[s] = []
            acc[s].push(m)
            return acc
        }, {})

        const chartData = Object.keys(porSemestre)
            .map(Number)
            .sort((a, b) => a - b)
            .map(sem => {
                const califs = porSemestre[sem]
                    .map(m => parseInt(m.calificacion, 10))
                    .filter(n => n > 0)

                const prom = califs.length
                    ? (califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1)
                    : null

                return {
                    name: `Sem ${sem}`,
                    promedio: prom ? parseFloat(prom) : null
                }
            })
            .filter(d => d.promedio !== null)

        return chartData
    }, [kardex])

    if (data.length === 0) return null

    return (
        <div style={{ width: '100%', height: 250, background: '#f8fafc', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--rule)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--ink-2)', marginBottom: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                Evolución del Promedio
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPromedio" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--rule)" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: 'var(--ink-3)' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[70, 100]}
                        tick={{ fontSize: 12, fill: 'var(--ink-3)' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: 'var(--accent)', fontWeight: 'bold' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="promedio"
                        stroke="var(--accent)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPromedio)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--accent)' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}