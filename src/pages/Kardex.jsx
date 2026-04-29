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
    const { logout, isAuth } = useAuth()
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

    const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

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

    const nav = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Horario', path: '/horario' },
        { label: 'Calificaciones', path: '/calificaciones' },
    ]

    const toggleSem = (sem) => {
        setExpandedSems(prev => ({ ...prev, [sem]: !prev[sem] }))
    }

    if (loading) return (
        <>
            <style>{CSS}</style>
            <div className="sii-shell">
                <header className="sii-header">
                    <div className="sii-header__wordmark">SII<span>ITC</span></div>
                </header>
                <main className="sii-main">
                    <div className="sii-loading">
                        <Skel w="220px" h="2rem" />
                        <Skel w="160px" h="1rem" />
                        <br />
                        {[...Array(5)].map((_, i) => <Skel key={i} w="100%" h="2.5rem" />)}
                    </div>
                </main>
            </div>
        </>
    )

    if (error) return (
        <>
            <style>{CSS}</style>
            <div className="sii-shell">
                <header className="sii-header">
                    <div className="sii-header__wordmark">SII<span>ITC</span></div>
                </header>
                <main className="sii-main">
                    <div className="sii-error">
                        <p className="sii-error__msg">{error}</p>
                        <button className="sii-btn" onClick={() => window.location.reload()}>
                            Reintentar
                        </button>
                    </div>
                </main>
            </div>
        </>
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
        <>
            <style>{CSS}</style>
            <div className="sii-shell">

                <header className="sii-header">
                    <div className="sii-header__left">
                        <button
                            className="sii-header__wordmark"
                            onClick={() => navigate('/dashboard')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            SII<span>ITC</span>
                        </button>
                    </div>

                    <nav className="sii-header__nav">
                        {nav.map(({ label, path }) => (
                            <button key={label} className="sii-header__link" onClick={() => navigate(path)}>
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="sii-header__right">
                        <button className="sii-header__logout" onClick={handleLogout}>
                            Cerrar sesión
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </header>

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

                    {/* ── Búsqueda ── */}
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
                            <button className="sii-search-clear" onClick={() => setQuery('')}>
                                ✕
                            </button>
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
                                        <h2 className="sii-sem-title">
                                            Semestre {sem}
                                        </h2>
                                        {prom_sem && (
                                            <span className="sii-sem-prom">
                                                Prom. {prom_sem}
                                            </span>
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

                <footer className="sii-footer">
                    <span>Tecnológico Nacional de México · Campus Celaya</span>
                    <span>Kardex · {new Date().getFullYear()}</span>
                </footer>
            </div>
        </>
    )
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink:     #0f172a;
  --ink-2:   #334155;
  --ink-3:   #64748b;
  --paper:   #ffffff;
  --rule:    #e2e8f0;
  --accent:  #2563eb;
  --accent-l:#eff6ff;
  --green:   #16a34a;
  --green-l: #ecfdf5;
  --red:     #dc2626;
  --red-l:   #fef2f2;
  --amber:   #d97706;
  --amber-l: #fffbeb;
  --radius:  20px;
  --font-serif: 'DM Serif Display', Georgia, serif;
  --font-sans:  'DM Sans', system-ui, sans-serif;
}

body { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e40af 45%, #4338ca 100%); color: var(--ink); font-family: var(--font-sans); }

.sii-shell { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem 3rem; gap: 2rem; }

/* ── Header ── */
.sii-header { width: min(1080px, 100%); display: flex; align-items: center; gap: 1.5rem; background: rgba(255,255,255,0.9); border-radius: 28px; padding: 1rem 1.5rem; box-shadow: 0 18px 50px rgba(15,23,42,0.12); backdrop-filter: blur(10px); }
.sii-header__wordmark { font-family: var(--font-sans); font-size: 1rem; letter-spacing: .08em; color: var(--ink); text-transform: uppercase; font-weight: 800; white-space: nowrap; text-decoration: none; }
.sii-header__wordmark span { color: var(--accent); }
.sii-header__nav { display: flex; align-items: center; gap: .5rem; flex: 1; }
.sii-header__link { background: rgba(37,99,235,0.08); border: none; cursor: pointer; font-family: var(--font-sans); font-size: .85rem; font-weight: 600; color: var(--ink-2); padding: .6rem 1rem; border-radius: 999px; transition: color .15s, background .15s, transform .15s; letter-spacing: .01em; }
.sii-header__link:hover { color: var(--ink); background: rgba(37,99,235,0.16); transform: translateY(-1px); }
.sii-header__right { display: flex; align-items: center; gap: .75rem; margin-left: auto; }
.sii-header__logout { display: inline-flex; align-items: center; gap: .4rem; background: var(--accent); border: none; cursor: pointer; font-family: var(--font-sans); font-size: .78rem; font-weight: 700; color: white; padding: .65rem 1rem; border-radius: 999px; transition: background .15s, transform .15s; }
.sii-header__logout:hover { background: #1d4ed8; transform: translateY(-1px); }

/* ── Main ── */
.sii-main { flex: 1; width: min(1080px, 100%); padding: 2.2rem 2rem 3rem; display: flex; flex-direction: column; gap: 2rem; background: white; border-radius: 32px; border: 1px solid rgba(226,232,240,0.75); box-shadow: 0 28px 70px rgba(15,23,42,0.12); }
.sii-divider { height: 1px; background: var(--rule); }

/* ── Page header ── */
.sii-page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; }
.sii-page-title { font-family: var(--font-serif); font-size: clamp(1.8rem, 3vw, 2.5rem); color: var(--ink); line-height: 1; letter-spacing: -.01em; }
.sii-page-sub { font-size: .85rem; color: var(--ink-3); margin-top: .35rem; }

/* ── Header stats ── */
.sii-header-stats { display: flex; gap: 1rem; flex-wrap: wrap; }
.sii-hstat { display: flex; flex-direction: column; align-items: center; gap: .2rem; padding: .85rem 1.25rem; border: 1px solid var(--rule); border-radius: 18px; background: #f8fafc; min-width: 72px; }
.sii-hstat--green { border-color: rgba(16,185,129,0.25); background: var(--green-l); }
.sii-hstat--red   { border-color: rgba(220,38,38,0.2);  background: var(--red-l); }
.sii-hstat__num { font-family: var(--font-sans); font-size: 1.5rem; font-weight: 700; color: var(--ink); line-height: 1; }
.sii-hstat--green .sii-hstat__num { color: var(--green); }
.sii-hstat--red   .sii-hstat__num { color: var(--red); }
.sii-hstat__label { font-size: .65rem; font-weight: 600; color: var(--ink-3); text-transform: uppercase; letter-spacing: .05em; }

/* ── Avance bar ── */
.sii-avance-bar { display: flex; flex-direction: column; gap: .5rem; }
.sii-avance-bar__header { display: flex; justify-content: space-between; align-items: baseline; }
.sii-avance-bar__label { font-size: .8rem; font-weight: 500; color: var(--ink-2); }
.sii-avance-bar__pct { font-family: var(--font-sans); font-size: 1rem; font-weight: 700; color: var(--accent); }
.sii-avance-bar__track { height: 8px; background: rgba(226,232,240,0.95); border-radius: 999px; overflow: hidden; }
.sii-avance-bar__fill { height: 100%; width: var(--pct); background: linear-gradient(90deg, var(--accent), #4f46e5); border-radius: 999px; transition: width .8s ease; }

/* ── Search ── */
.sii-search-wrap { position: relative; display: flex; align-items: center; }
.sii-search-icon { position: absolute; left: 1rem; color: var(--ink-3); pointer-events: none; }
.sii-search { width: 100%; padding: .85rem 1rem .85rem 2.75rem; border: 1.5px solid var(--rule); border-radius: 999px; font-family: var(--font-sans); font-size: .9rem; color: var(--ink); background: #f8fafc; outline: none; transition: border-color .15s, box-shadow .15s; }
.sii-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: white; }
.sii-search-clear { position: absolute; right: 1rem; background: none; border: none; cursor: pointer; font-size: .85rem; color: var(--ink-3); line-height: 1; padding: .25rem; }
.sii-search-clear:hover { color: var(--ink); }

/* ── Semestre section ── */
.sii-sem-section { display: flex; flex-direction: column; gap: .75rem; }
.sii-sem-header { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.sii-sem-title { font-family: var(--font-sans); font-size: .95rem; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: .06em; }
.sii-sem-prom { font-size: .78rem; font-weight: 600; color: var(--accent); background: var(--accent-l); padding: .25rem .65rem; border-radius: 999px; }
.sii-sem-count { font-size: .75rem; color: var(--ink-3); margin-left: auto; }

/* ── Kardex table ── */
.sii-kardex-table { border: 1px solid rgba(226,232,240,0.95); border-radius: 20px; overflow: hidden; }
.sii-kardex-table__head { display: grid; grid-template-columns: 1fr 7rem 5rem 3.5rem 4rem; gap: .5rem; padding: .65rem 1.25rem; background: #f8fafc; border-bottom: 1px solid var(--rule); font-size: .7rem; font-weight: 700; color: var(--ink-3); text-transform: uppercase; letter-spacing: .06em; }
.sii-kardex-table__row { display: grid; grid-template-columns: 1fr 7rem 5rem 3.5rem 4rem; gap: .5rem; padding: .85rem 1.25rem; border-bottom: 1px solid rgba(226,232,240,0.7); align-items: center; transition: background .12s; }
.sii-kardex-table__row:last-child { border-bottom: none; }
.sii-kardex-table__row:hover { background: #f8fafc; }

.sii-mat-nombre { font-size: .85rem; font-weight: 500; color: var(--ink); display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
.sii-mat-clave  { font-size: .75rem; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.sii-mat-periodo { font-size: .78rem; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.sii-mat-creditos { font-size: .8rem; font-weight: 600; color: var(--ink-2); text-align: center; }

/* ── Badge ── */
.sii-badge { font-size: .62rem; font-weight: 700; letter-spacing: .05em; padding: .15rem .45rem; border-radius: 999px; flex-shrink: 0; }
.sii-badge--rep { background: rgba(217,119,6,0.15); color: var(--amber); }
/* Cambiamos el color a rojo para indicar situación crítica */
.sii-badge--esp { background: var(--red-l); color: var(--red); border: 1px solid rgba(220,38,38,0.3); }

/* ── Calificacion ── */
.sii-calificacion { font-family: var(--font-sans); font-size: .9rem; font-weight: 700; text-align: center; padding: .3rem .5rem; border-radius: 8px; font-variant-numeric: tabular-nums; }
.sii-calificacion--good { background: var(--green-l);  color: var(--green); }
.sii-calificacion--ok   { background: var(--accent-l); color: var(--accent); }
.sii-calificacion--warn { background: var(--amber-l);  color: var(--amber); }
.sii-calificacion--bad  { background: var(--red-l);    color: var(--red); }

/* ── Empty state ── */
.sii-empty { text-align: center; padding: 3rem 1rem; font-size: .9rem; color: var(--ink-3); }
.sii-empty strong { color: var(--ink-2); }

/* ── Skeleton / Error / Button ── */
.sii-skel { background: linear-gradient(90deg, var(--rule) 25%, #e4e4e7 50%, var(--rule) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: var(--radius); }
@keyframes shimmer { to { background-position: -200% 0; } }
.sii-loading { display: flex; flex-direction: column; gap: .75rem; }
.sii-error { display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; }
.sii-error__msg { font-size: .9rem; color: var(--red); }
.sii-btn { font-family: var(--font-sans); font-size: .88rem; font-weight: 700; color: white; background: var(--accent); border: none; cursor: pointer; padding: .85rem 1.4rem; border-radius: 999px; transition: transform .15s, background .15s; }
.sii-btn:hover { background: #1d4ed8; transform: translateY(-1px); }

/* ── Footer ── */
.sii-footer { border-top: 1px solid var(--rule); padding: 1rem 2rem; display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; font-size: .7rem; color: var(--ink-3); }

/* ── Responsive ── */
@media (max-width: 720px) {
  .sii-main { padding: 1.5rem 1rem 2rem; }
  .sii-header__nav { display: none; }
  .sii-kardex-table__head,
  .sii-kardex-table__row { grid-template-columns: 1fr 4.5rem 3.5rem; }
  .sii-kardex-table__head span:nth-child(2),
  .sii-kardex-table__row .sii-mat-clave,
  .sii-kardex-table__head span:nth-child(3),
  .sii-kardex-table__row .sii-mat-periodo { display: none; }
  .sii-header-stats { gap: .5rem; }
  .sii-hstat { padding: .65rem .9rem; min-width: 58px; }
}
`