import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getHorarios } from '../api/endpoints'

const DIAS = [
    { key: 'lunes', label: 'Lun' },
    { key: 'martes', label: 'Mar' },
    { key: 'miercoles', label: 'Mié' },
    { key: 'jueves', label: 'Jue' },
    { key: 'viernes', label: 'Vie' },
    { key: 'sabado', label: 'Sáb' },
]

const COLORES = [
    { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8' },
    { bg: '#ecfdf5', border: '#16a34a', text: '#15803d' },
    { bg: '#fdf4ff', border: '#9333ea', text: '#7e22ce' },
    { bg: '#fff7ed', border: '#ea580c', text: '#c2410c' },
    { bg: '#f0fdf4', border: '#0d9488', text: '#0f766e' },
    { bg: '#fef9c3', border: '#ca8a04', text: '#a16207' },
]

function Skel({ w = '100%', h = '1rem' }) {
    return <span className="sii-skel" style={{ width: w, height: h, display: 'block' }} />
}

export default function Horario() {
    const { logout, isAuth } = useAuth()
    const navigate = useNavigate()
    const [raw, setRaw] = useState(null)
    const [loading, setLoad] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!isAuth) { navigate('/login', { replace: true }); return }
        getHorarios()
            .then(res => {
                const d = res.data ?? res
                setRaw(Array.isArray(d) ? d[0] : d)
            })
            .catch(err => {
                if (err.response?.status === 401) navigate('/login', { replace: true })
                else setError('No se pudo obtener el horario del servidor.')
            })
            .finally(() => setLoad(false))
    }, [isAuth, navigate])

    const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

    const nav = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Kardex', path: '/kardex' },
        { label: 'Calificaciones', path: '/calificaciones' },
    ]

    if (loading) return (
        <>
            <style>{CSS}</style>
            <div className="sii-shell">
                <header className="sii-header">
                    <div className="sii-header__wordmark">SII<span>ITC</span></div>
                </header>
                <main className="sii-main">
                    <div className="sii-loading">
                        <Skel w="200px" h="2rem" />
                        <Skel w="150px" h="1rem" />
                        <br />
                        <Skel w="100%" h="200px" />
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

    if (!raw) return null

    const periodo = raw.periodo
    const clases = raw.horario ?? []

    const hoy = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][new Date().getDay()]

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
                            <h1 className="sii-page-title">Horario</h1>
                            {periodo && (
                                <p className="sii-page-sub">
                                    {periodo.descripcion_periodo} · Período {periodo.clave_periodo}
                                </p>
                            )}
                        </div>
                        <div className="sii-periodo-badge">
                            <span className="sii-periodo-badge__num">{clases.length}</span>
                            <span className="sii-periodo-badge__label">materias</span>
                        </div>
                    </section>

                    <div className="sii-divider" />

                    <section className="sii-agenda">
                        <div className="sii-agenda__head">
                            <div className="sii-agenda__head-spacer" />
                            {DIAS.map(({ key, label }) => (
                                <div
                                    key={key}
                                    className={`sii-agenda__day-label ${hoy === key ? 'sii-agenda__day-label--hoy' : ''}`}
                                >
                                    {label}
                                    {hoy === key && <span className="sii-hoy-dot" />}
                                </div>
                            ))}
                        </div>

                        {clases.map((clase, idx) => {
                            const color = COLORES[idx % COLORES.length]
                            return (
                                <div key={clase.id_grupo} className="sii-agenda__row">
                                    <div
                                        className="sii-agenda__materia"
                                        style={{ borderLeftColor: color.border }}
                                    >
                                        <span className="sii-agenda__mat-nombre">
                                            {clase.nombre_materia}
                                        </span>
                                        <span className="sii-agenda__mat-clave">
                                            {clase.clave_materia} · Gpo {clase.letra_grupo}
                                        </span>
                                    </div>

                                    {DIAS.map(({ key }) => {
                                        const hora = clase[key]
                                        const salon = clase[`${key}_clave_salon`]
                                        const esHoy = hoy === key
                                        return (
                                            <div
                                                key={key}
                                                className={`sii-agenda__cell ${esHoy ? 'sii-agenda__cell--hoy' : ''}`}
                                            >
                                                {hora ? (
                                                    <div
                                                        className="sii-clase-chip"
                                                        style={{
                                                            background: color.bg,
                                                            borderColor: color.border,
                                                            color: color.text,
                                                        }}
                                                    >
                                                        <span className="sii-clase-chip__hora">{hora}</span>
                                                        {salon && (
                                                            <span className="sii-clase-chip__salon">{salon}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="sii-agenda__empty-cell" />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </section>

                    <div className="sii-divider" />

                    <section>
                        <h2 className="sii-section-title">Detalle de materias</h2>
                        <div className="sii-clases-list">
                            {clases.map((clase, idx) => {
                                const color = COLORES[idx % COLORES.length]
                                const diasCon = DIAS.filter(({ key }) => clase[key])
                                return (
                                    <div
                                        key={clase.id_grupo}
                                        className="sii-clase-card"
                                        style={{ borderLeftColor: color.border }}
                                    >
                                        <div className="sii-clase-card__head">
                                            <span className="sii-clase-card__nombre">
                                                {clase.nombre_materia}
                                            </span>
                                            <span className="sii-clase-card__clave">
                                                {clase.clave_materia}
                                            </span>
                                        </div>
                                        <div className="sii-clase-card__dias">
                                            {diasCon.map(({ key, label }) => (
                                                <div key={key} className="sii-clase-dia">
                                                    <span
                                                        className="sii-clase-dia__label"
                                                        style={{ color: color.text }}
                                                    >
                                                        {label}
                                                    </span>
                                                    <span className="sii-clase-dia__hora">
                                                        {clase[key]}
                                                    </span>
                                                    {clase[`${key}_clave_salon`] && (
                                                        <span className="sii-clase-dia__salon">
                                                            {clase[`${key}_clave_salon`]}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                </main>

                <footer className="sii-footer">
                    <span>Tecnológico Nacional de México · Campus Celaya</span>
                    <span>Horario · {new Date().getFullYear()}</span>
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

/* ── Periodo badge ── */
.sii-periodo-badge { display: flex; flex-direction: column; align-items: center; padding: .85rem 1.25rem; border: 1px solid var(--rule); border-radius: 18px; background: #f8fafc; }
.sii-periodo-badge__num { font-family: var(--font-sans); font-size: 1.5rem; font-weight: 700; color: var(--accent); line-height: 1; }
.sii-periodo-badge__label { font-size: .65rem; font-weight: 600; color: var(--ink-3); text-transform: uppercase; letter-spacing: .05em; }

/* ── Agenda ── */
.sii-agenda { display: flex; flex-direction: column; gap: .5rem; overflow-x: auto; }

.sii-agenda__head { display: grid; grid-template-columns: 220px repeat(6, 1fr); gap: .4rem; margin-bottom: .25rem; }
.sii-agenda__head-spacer { }
.sii-agenda__day-label { display: flex; flex-direction: column; align-items: center; gap: .3rem; font-size: .72rem; font-weight: 700; color: var(--ink-3); text-transform: uppercase; letter-spacing: .06em; padding: .5rem; border-radius: 12px; }
.sii-agenda__day-label--hoy { background: var(--accent-l); color: var(--accent); }
.sii-hoy-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); }

.sii-agenda__row { display: grid; grid-template-columns: 220px repeat(6, 1fr); gap: .4rem; align-items: center; }

.sii-agenda__materia { padding: .75rem 1rem; border-left: 3px solid transparent; border-radius: 12px; background: #f8fafc; display: flex; flex-direction: column; gap: .2rem; }
.sii-agenda__mat-nombre { font-size: .8rem; font-weight: 600; color: var(--ink); line-height: 1.3; }
.sii-agenda__mat-clave  { font-size: .68rem; color: var(--ink-3); }

.sii-agenda__cell { display: flex; align-items: center; justify-content: center; min-height: 60px; }
.sii-agenda__cell--hoy { background: rgba(37,99,235,0.03); border-radius: 10px; }
.sii-agenda__empty-cell { width: 100%; height: 100%; }

/* ── Clase chip ── */
.sii-clase-chip { width: 100%; border: 1.5px solid; border-radius: 10px; padding: .5rem .6rem; display: flex; flex-direction: column; gap: .2rem; }
.sii-clase-chip__hora  { font-size: .72rem; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1; }
.sii-clase-chip__salon { font-size: .65rem; font-weight: 500; opacity: .8; }

/* ── Section title ── */
.sii-section-title { font-family: var(--font-sans); font-size: 1rem; font-weight: 700; color: var(--ink); letter-spacing: -.01em; margin-bottom: 1rem; }

/* ── Clases list ── */
.sii-clases-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }

.sii-clase-card { border: 1px solid var(--rule); border-left: 3px solid transparent; border-radius: 16px; padding: 1.1rem 1.25rem; display: flex; flex-direction: column; gap: .85rem; background: #f8fafc; }
.sii-clase-card__head { display: flex; flex-direction: column; gap: .2rem; }
.sii-clase-card__nombre { font-size: .9rem; font-weight: 600; color: var(--ink); line-height: 1.3; }
.sii-clase-card__clave  { font-size: .72rem; color: var(--ink-3); }
.sii-clase-card__dias   { display: flex; flex-direction: column; gap: .5rem; }

.sii-clase-dia { display: flex; align-items: center; gap: .6rem; }
.sii-clase-dia__label { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; min-width: 2rem; }
.sii-clase-dia__hora  { font-size: .78rem; font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums; }
.sii-clase-dia__salon { font-size: .72rem; color: var(--ink-3); background: white; border: 1px solid var(--rule); padding: .1rem .45rem; border-radius: 999px; }

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
  .sii-agenda { font-size: .75rem; }
  .sii-agenda__head,
  .sii-agenda__row { grid-template-columns: 160px repeat(6, 1fr); }
  .sii-clase-chip__hora { font-size: .65rem; }
}
`