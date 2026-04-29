import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCalificaciones } from '../api/endpoints'
import { getCriterios } from '../api/simuladorEndpoints'

function gradeColor(n) {
    if (n === null || n === undefined || isNaN(n)) return 'var(--ink-3)'
    if (n >= 90) return 'var(--green)'
    if (n >= 80) return '#84cc16'
    if (n >= 70) return 'var(--amber)'
    return 'var(--red)'
}

function gradeLabel(n) {
    if (n === null || n === undefined || isNaN(n)) return 'Sin datos'
    if (n >= 90) return 'Excelente'
    if (n >= 80) return 'Bien'
    if (n >= 70) return 'Suficiente'
    return 'En riesgo'
}

function calcParcial(inputs, criterios) {
    if (!criterios?.length) return null
    let total = 0
    let pesoUsado = 0
    criterios.forEach(c => {
        const val = parseFloat(inputs[c.nombre])
        if (!isNaN(val)) {
            total += (val * c.peso) / 100
            pesoUsado += c.peso
        }
    })
    if (pesoUsado === 0) return null
    return (total / pesoUsado) * 100
}

function Skel() {
    return <span className="sii-skel" style={{ width: '100%', height: '5rem', display: 'block', borderRadius: '16px' }} />
}

function MateriaCard({ materia, calificaciones, onSelect }) {
    const vals = calificaciones.map(c => parseFloat(c.calificacion)).filter(n => !isNaN(n))
    const prom = vals.length ? (vals.reduce((s, n) => s + n, 0) / vals.length).toFixed(1) : null
    const color = gradeColor(prom)

    return (
        <div
            onClick={onSelect}
            style={{
                background: '#fff',
                border: '1px solid var(--rule)',
                borderRadius: '24px',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(15,23,42,0.05)',
                transition: 'transform .2s, box-shadow .2s',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.10)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.05)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                        {materia.nombre_materia}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>
                        {materia.clave_materia} · Gpo {materia.letra_grupo}
                    </p>
                </div>
                {prom && (
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1, flexShrink: 0 }}>
                        {prom}
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4].map(n => {
                    const c = calificaciones.find(c => c.numero_calificacion === n)
                    const val = c?.calificacion
                    return (
                        <span key={n} style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '999px',
                            background: val ? 'var(--accent-l)' : '#f8fafc',
                            color: val ? 'var(--accent)' : 'var(--ink-3)',
                            border: '1px solid var(--rule)',
                            fontWeight: val ? 600 : 400,
                        }}>
                            P{n} {val ?? '—'}
                        </span>
                    )
                })}
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginTop: '0.75rem' }}>
                Simular →
            </p>
        </div>
    )
}

function SimuladorDetalle({ materia, onClose }) {
    const [parcial, setParcial] = useState(1)
    const [criterios, setCriterios] = useState([])
    const [inputs, setInputs] = useState({})
    const [loadingCriterios, setLoadingCriterios] = useState(false)

    useEffect(() => {
        setLoadingCriterios(true)
        setInputs({})
        getCriterios(materia.clave_materia, parcial)
            .then(data => setCriterios(data.items ?? []))
            .catch(() => setCriterios([]))
            .finally(() => setLoadingCriterios(false))
    }, [materia.clave_materia, parcial])

    function updateInput(nombre, value) {
        const num = value === '' ? '' : String(Math.min(100, Math.max(0, parseFloat(value) || 0)))
        setInputs(prev => ({ ...prev, [nombre]: num }))
    }

    const resultado = calcParcial(inputs, criterios)
    const color = gradeColor(resultado)

    return (
        <div style={{
            background: '#fff',
            border: '2px solid var(--accent)',
            borderRadius: '24px',
            padding: '1.75rem',
            boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
            animation: 'expandIn .25s ease',
        }}>
            <style>{`
                @keyframes expandIn {
                    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes collapseOut {
                    from { opacity: 1; transform: scale(1); }
                    to   { opacity: 0; transform: scale(0.98); }
                }
                .parcial-btn {
                    flex: 1;
                    padding: 0.5rem;
                    border-radius: 999px;
                    border: 1px solid var(--rule);
                    background: #f8fafc;
                    color: var(--ink-3);
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all .15s;
                    font-family: var(--font-sans);
                }
                .parcial-btn.active {
                    border-color: var(--accent);
                    background: var(--accent-l);
                    color: var(--accent);
                    font-weight: 700;
                }
                .criterio-input {
                    padding: 0.5rem;
                    background: #f8fafc;
                    border: 1.5px solid var(--rule);
                    border-radius: 10px;
                    color: var(--ink);
                    font-size: 0.95rem;
                    font-weight: 700;
                    text-align: center;
                    width: 100%;
                    font-family: var(--font-sans);
                    transition: border-color .15s;
                }
                .criterio-input:focus {
                    outline: none;
                    border-color: var(--accent);
                }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                    <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>{materia.nombre_materia}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--ink-3)', marginTop: '0.2rem' }}>
                        {materia.clave_materia} · Gpo {materia.letra_grupo}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: '#f8fafc',
                        border: '1px solid var(--rule)',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        color: 'var(--ink-3)',
                        fontSize: '0.8rem',
                        padding: '0.3rem 0.75rem',
                        fontFamily: 'var(--font-sans)',
                    }}
                >
                    ✕ Cerrar
                </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[1, 2, 3, 4].map(n => (
                    <button
                        key={n}
                        onClick={() => setParcial(n)}
                        className={`parcial-btn ${parcial === n ? 'active' : ''}`}
                    >
                        Parcial {n}
                    </button>
                ))}
            </div>

            {loadingCriterios ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[...Array(3)].map((_, i) => (
                        <span key={i} className="sii-skel" style={{ height: '3rem', display: 'block', borderRadius: '10px' }} />
                    ))}
                </div>
            ) : !criterios.length ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-3)', fontSize: '0.88rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--rule)' }}>
                    Este parcial no tiene criterios configurados.
                </div>
            ) : (
                <>
                    <div style={{ border: '1px solid var(--rule)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: '0', background: '#f8fafc', padding: '0.6rem 1rem', borderBottom: '1px solid var(--rule)' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Criterio</p>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'center' }}>Tu nota</p>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'center' }}>Aporta</p>
                        </div>

                        {criterios.map((c, i) => {
                            const val = parseFloat(inputs[c.nombre])
                            const aporte = !isNaN(val) ? ((val * c.peso) / 100).toFixed(1) : '—'
                            return (
                                <div
                                    key={i}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 90px 90px',
                                        alignItems: 'center',
                                        padding: '0.85rem 1rem',
                                        borderBottom: i < criterios.length - 1 ? '1px solid var(--rule)' : 'none',
                                        background: '#fff',
                                    }}
                                >
                                    <div>
                                        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)' }}>{c.nombre}</p>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>Vale {c.peso}%</p>
                                    </div>
                                    <div style={{ padding: '0 0.25rem' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={inputs[c.nombre] ?? ''}
                                            onChange={e => updateInput(c.nombre, e.target.value)}
                                            placeholder="0"
                                            className="criterio-input"
                                        />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            color: !isNaN(val) ? gradeColor(val) : 'var(--ink-3)',
                                        }}>
                                            {aporte}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '16px',
                        background: resultado !== null ? `${color}11` : '#f8fafc',
                        border: `1.5px solid ${resultado !== null ? color : 'var(--rule)'}`,
                        transition: 'all .3s',
                    }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--ink-3)', marginBottom: '0.2rem' }}>
                                Calificación del parcial {parcial}
                            </p>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color }}>
                                {gradeLabel(resultado)}
                            </p>
                        </div>
                        <span style={{ fontSize: '2.75rem', fontWeight: 800, color, lineHeight: 1, fontFamily: 'var(--font-serif)' }}>
                            {resultado !== null ? resultado.toFixed(1) : '—'}
                        </span>
                    </div>
                </>
            )}
        </div>
    )
}

export default function Simulador() {
    const { isAuth } = useAuth()
    const navigate = useNavigate()

    const [materias, setMaterias] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedClave, setSelectedClave] = useState(null)

    useEffect(() => {
        if (!isAuth) { navigate('/login', { replace: true }); return }
        getCalificaciones()
            .then(res => {
                const payload = (res.data ?? res)[0]
                setMaterias(payload.materias ?? [])
            })
            .catch(err => {
                if (err.response?.status === 401) navigate('/login', { replace: true })
                else setError('No se pudo cargar el simulador.')
            })
            .finally(() => setLoading(false))
    }, [isAuth, navigate])

    if (loading) return (
        <main className="sii-main">
            <div className="sii-loading">
                <span className="sii-skel" style={{ width: '260px', height: '2rem', display: 'block', marginBottom: '0.5rem' }} />
                <span className="sii-skel" style={{ width: '180px', height: '1rem', display: 'block', marginBottom: '1.5rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {[...Array(5)].map((_, i) => <Skel key={i} />)}
                </div>
            </div>
        </main>
    )

    if (error) return (
        <main className="sii-main">
            <div className="sii-error">
                <p className="sii-error__msg">{error}</p>
                <button className="sii-btn" onClick={() => window.location.reload()}>Reintentar</button>
            </div>
        </main>
    )

    return (
        <main className="sii-main">
            <section className="sii-page-header">
                <div>
                    <p className="sii-page-header__eyebrow">SII ITC · Simulador</p>
                    <h1 className="sii-page-header__title">Simulador de Calificaciones</h1>
                    <p className="sii-page-header__sub">
                        {selectedClave
                            ? 'Ingresa tus notas por criterio para calcular tu calificación del parcial'
                            : 'Selecciona una materia para simular tu calificación'
                        }
                    </p>
                </div>
            </section>

            <div className="sii-divider" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                {materias.map((m, i) => {
                    const mat = m.materia ?? {}
                    const clave = mat.clave_materia
                    const selected = selectedClave === clave

                    return (
                        <div key={i} style={{ gridColumn: selected ? '1 / -1' : 'auto' }}>
                            {selected ? (
                                <SimuladorDetalle
                                    materia={mat}
                                    onClose={() => setSelectedClave(null)}
                                />
                            ) : (
                                <MateriaCard
                                    materia={mat}
                                    calificaciones={m.calificaiones ?? []}
                                    onSelect={() => setSelectedClave(clave)}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </main>
    )
}