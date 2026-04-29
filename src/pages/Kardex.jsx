import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getKardex } from '../api/endpoints'
import GraficoPromedios from '../components/GraficoPromedios'

const calif = (v) => parseInt(v, 10)

const colorClase = (v) => {
    const n = calif(v)
    if (n === 0) return 'bad'
    if (n >= 90) return 'good'
    if (n >= 80) return 'ok'
    if (n >= 70) return 'warn'
    return 'bad'
}

const descBadge = (desc) => {
    if (!desc) return null
    if (desc.includes('REPETICIÓN')) return { label: 'REP', cls: 'rep' }
    if (desc.includes('ESPECIAL')) return { label: 'ESP', cls: 'esp' }
    return null
}

function Skel({ w = '100%', h = '1rem' }) {
    return <span className="sii-skel" style={{ width: w, height: h, display: 'block' }} />
}

export default function Kardex() {
    const { isAuth } = useAuth()
    const navigate = useNavigate()
    const [raw, setRaw] = useState(null)
    const [loading, setLoad] = useState(true)
    const [error, setError] = useState(null)
    const [query, setQuery] = useState('')
    const [expandedSems, setExpandedSems] = useState({})

    useEffect(() => {
        if (!isAuth) { navigate('/login', { replace: true }); return }
        getKardex()
            .then(res => setRaw(res.data ?? res))
            .catch(err => {
                if (err.response?.status === 401) navigate('/login', { replace: true })
                else setError('No se pudo obtener el kardex del servidor.')
            })
            .finally(() => setLoad(false))
    }, [isAuth, navigate])

    const semestres = useMemo(() => {
        if (!raw?.kardex) return {}
        const q = query.toLowerCase().trim()
        const filtradas = q
            ? raw.kardex.filter(m =>
                m.nombre_materia.toLowerCase().includes(q) ||
                m.clave_materia.toLowerCase().includes(q)
            )
            : raw.kardex

        return filtradas.reduce((acc, m) => {
            const s = m.semestre ?? 0
            if (!acc[s]) acc[s] = []
            acc[s].push(m)
            return acc
        }, {})
    }, [raw, query])

    const toggleSem = (sem) => {
        setExpandedSems(prev => ({ ...prev, [sem]: !prev[sem] }))
    }

    if (loading) return (
        <main className="sii-main">
            <div className="sii-loading">
                <Skel w="220px" h="2rem" />
                <Skel w="160px" h="1rem" />
                <br />
                {[...Array(5)].map((_, i) => <Skel key={i} w="100%" h="2.5rem" />)}
            </div>
        </main>
    )

    if (error) return (
        <main className="sii-main">
            <div className="sii-error">
                <p className="sii-error__msg">{error}</p>
                <button className="sii-btn" onClick={() => window.location.reload()}>
                    Reintentar
                </button>
            </div>
        </main>
    )

    const avance = raw?.porcentaje_avance ?? 0
    const total = raw?.kardex?.length ?? 0
    const aprob = raw?.kardex?.filter(m => calif(m.calificacion) >= 70).length ?? 0
    const repro = raw?.kardex?.filter(m => calif(m.calificacion) < 70).length ?? 0

    const califs = raw?.kardex?.map(m => calif(m.calificacion)).filter(n => n > 0) ?? []
    const promedio = califs.length
        ? (califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1)
        : '—'

    const semKeys = Object.keys(semestres).map(Number).sort((a, b) => a - b)

    return (
        <main className="sii-main">
            <section className="sii-page-header">
                <div>
                    <h1 className="sii-page-title">Kardex</h1>
                    <p className="sii-page-sub">Historial académico completo</p>
                </div>
                <div className="sii-header-stats">
                    <div className="sii-hstat">
                        <span className="sii-hstat__num">{promedio}</span>
                        <span className="sii-hstat__label">Promedio</span>
                    </div>
                    <div className="sii-hstat sii-hstat--green">
                        <span className="sii-hstat__num">{aprob}</span>
                        <span className="sii-hstat__label">Aprobadas</span>
                    </div>
                    <div className="sii-hstat sii-hstat--red">
                        <span className="sii-hstat__num">{repro}</span>
                        <span className="sii-hstat__label">Reprobadas</span>
                    </div>
                    <div className="sii-hstat">
                        <span className="sii-hstat__num">{total}</span>
                        <span className="sii-hstat__label">Total</span>
                    </div>
                </div>
            </section>

            <div className="sii-avance-bar">
                <div className="sii-avance-bar__header">
                    <span className="sii-avance-bar__label">Avance del plan de estudios</span>
                    <span className="sii-avance-bar__pct">{avance}%</span>
                </div>
                <div className="sii-avance-bar__track">
                    <div className="sii-avance-bar__fill" style={{ '--pct': `${avance}%` }} />
                </div>
            </div>

            <div className="sii-divider" />

            {!loading && raw?.kardex && (
                <GraficoPromedios kardex={raw.kardex} />
            )}

            <div className="sii-search-wrap">
                <svg className="sii-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    className="sii-search"
                    type="text"
                    placeholder="Buscar materia o clave..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                {query && (
                    <button className="sii-search-clear" onClick={() => setQuery('')}>✕</button>
                )}
            </div>

            {semKeys.length === 0 ? (
                <div className="sii-empty">
                    No se encontraron materias con "<strong>{query}</strong>"
                </div>
            ) : (
                semKeys.map(sem => {
                    const mats = semestres[sem]
                    const calif_sem = mats
                        .map(m => calif(m.calificacion))
                        .filter(n => n > 0)
                    const prom_sem = calif_sem.length
                        ? (calif_sem.reduce((a, b) => a + b, 0) / calif_sem.length).toFixed(1)
                        : null

                    const isExpanded = expandedSems[sem] || false

                    return (
                        <section key={sem} className="sii-sem-section">
                            <div
                                className="sii-sem-header"
                                onClick={() => toggleSem(sem)}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                                <h2 className="sii-sem-title">Semestre {sem}</h2>
                                {prom_sem && (
                                    <span className="sii-sem-prom">Prom. {prom_sem}</span>
                                )}
                                <span className="sii-sem-count">
                                    {mats.length} materia{mats.length !== 1 ? 's' : ''}
                                </span>
                                <svg
                                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    style={{
                                        marginLeft: '0.5rem',
                                        color: 'var(--ink-3)',
                                        transition: 'transform 0.2s',
                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>

                            {isExpanded && (
                                <div className="sii-kardex-table">
                                    <div className="sii-kardex-table__head">
                                        <span>Materia</span>
                                        <span>Clave</span>
                                        <span>Período</span>
                                        <span>Créd.</span>
                                        <span>Calif.</span>
                                    </div>
                                    {mats.map((m, i) => {
                                        const badge = descBadge(m.descripcion)
                                        const cc = colorClase(m.calificacion)
                                        const n = calif(m.calificacion)
                                        return (
                                            <div key={i} className="sii-kardex-table__row">
                                                <span className="sii-mat-nombre">
                                                    {m.nombre_materia}
                                                    {badge && (
                                                        <span className={`sii-badge sii-badge--${badge.cls}`}>
                                                            {badge.label}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="sii-mat-clave">{m.clave_materia}</span>
                                                <span className="sii-mat-periodo">{m.periodo}</span>
                                                <span className="sii-mat-creditos">{m.creditos}</span>
                                                <span className={`sii-calificacion sii-calificacion--${cc}`}>
                                                    {n === 0 ? '—' : n}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </section>
                    )
                })
            )}
        </main>
    )
}