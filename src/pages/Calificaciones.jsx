import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCalificaciones } from '../api/endpoints'

/* ─────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────── */
function Skel({ w = '100%', h = '1rem' }) {
  return <span className="sii-skel" style={{ width: w, height: h, display: 'block' }} />
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function gradeClass(g) {
  const n = parseFloat(g)
  if (isNaN(n) || g === null) return 'na'
  if (n >= 90) return 'good'
  if (n >= 80) return 'ok'
  if (n >= 70) return 'warn'
  return 'bad'
}

function gradeLabel(g) {
  const n = parseFloat(g)
  if (isNaN(n) || g === null) return 'Pendiente'
  if (n >= 90) return 'Excelente'
  if (n >= 80) return 'Bien'
  if (n >= 70) return 'Suficiente'
  return 'Reprobado'
}

/* Calcula promedio de parciales con valor */
function calcPromedio(calificaciones) {
  const vals = (calificaciones ?? [])
    .map(c => parseFloat(c.calificacion))
    .filter(n => !isNaN(n))
  if (!vals.length) return null
  return (vals.reduce((s, n) => s + n, 0) / vals.length).toFixed(1)
}

/* Badge de calificación */
function GradeBadge({ value }) {
  const cls = gradeClass(value)
  const display = value === null || value === undefined ? 'S/C' : value
  return <span className={`sii-grade-badge sii-grade-badge--${cls}`}>{display}</span>
}

/* Barra de progreso */
function GradeBar({ value }) {
  const pct  = Math.min(parseFloat(value) || 0, 100)
  const cls  = gradeClass(value)
  return (
    <div className="sii-bar__track">
      <div className={`sii-bar__fill sii-bar__fill--${cls}`} style={{ '--pct': `${pct}%` }} />
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN — CALIFICACIONES
═══════════════════════════════════════════ */
export default function Calificaciones() {
  const { logout, isAuth } = useAuth()
  const navigate = useNavigate()

  const [periodo, setPeriodo]   = useState(null)   // { clave_periodo, anio, descripcion_periodo }
  const [materias, setMaterias] = useState([])      // array de { materia, calificaiones }
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [view, setView]         = useState('tabla')

  /* ── Fetch ── */
  useEffect(() => {
    if (!isAuth) { navigate('/login', { replace: true }); return }
   getCalificaciones()
  .then(res => {
  const payload = (res.data ?? res)[0]
  console.log('primera materia:', JSON.stringify(payload.materias[0], null, 2)) // ← agrega
  setPeriodo(payload.periodo ?? null)
  setMaterias(payload.materias ?? [])
})
      .catch(err => {
        if (err.response?.status === 401) navigate('/login', { replace: true })
        else setError('No se pudieron obtener las calificaciones.')
      })
      .finally(() => setLoading(false))
  }, [isAuth, navigate])

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  /* ── Filtrado por búsqueda ── */
  const filtered = useMemo(() => {
    if (!search.trim()) return materias
    const q = search.toLowerCase()
    return materias.filter(m =>
      (m.materia?.nombre_materia ?? '').toLowerCase().includes(q) ||
      (m.materia?.clave_materia  ?? '').toLowerCase().includes(q)
    )
  }, [materias, search])

  /* ── Stats generales ── */
  const stats = useMemo(() => {
    const promedios = materias
      .map(m => parseFloat(calcPromedio(m.calificaiones)))
      .filter(n => !isNaN(n))
    if (!promedios.length) return { promedio: '—', aprobadas: 0, reprobadas: 0, pendientes: 0 }
    return {
      promedio:   (promedios.reduce((s, n) => s + n, 0) / promedios.length).toFixed(1),
      aprobadas:  promedios.filter(n => n >= 70).length,
      reprobadas: promedios.filter(n => n < 70).length,
      pendientes: materias.filter(m => calcPromedio(m.calificaiones) === null).length,
    }
  }, [materias])

  const nav = [
    { label: 'Dashboard',      path: '/dashboard'      },
    { label: 'Calificaciones', path: '/calificaciones' },
    { label: 'Kardex',         path: '/kardex'         },
    { label: 'Horario',        path: '/horario'        },
  ]

  /* ══ LOADING ══ */
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="sii-shell">
        <header className="sii-header">
          <div className="sii-header__wordmark">SII<span>ITC</span></div>
        </header>
        <main className="sii-main">
          <div className="sii-loading">
            <Skel w="240px" h="2rem" />
            <Skel w="180px" h="1rem" />
            <br />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
              {[...Array(4)].map((_, i) => <Skel key={i} h="5rem" />)}
            </div>
            <br />
            {[...Array(5)].map((_, i) => <Skel key={i} h="3rem" />)}
          </div>
        </main>
      </div>
    </>
  )

  /* ══ ERROR ══ */
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
            <button className="sii-btn" onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        </main>
      </div>
    </>
  )

  /* ══ RENDER ══ */
  return (
    <>
      <style>{CSS}</style>
      <div className="sii-shell">

        {/* HEADER */}
        <header className="sii-header">
          <button
            className="sii-header__wordmark"
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            SII<span>ITC</span>
          </button>

          <nav className="sii-header__nav">
            {nav.map(({ label, path }) => (
              <button
                key={label}
                className={`sii-header__link${path === '/calificaciones' ? ' sii-header__link--active' : ''}`}
                onClick={() => navigate(path)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="sii-header__right">
            <button className="sii-header__logout" onClick={handleLogout}>
              Cerrar sesión
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </header>

        <main className="sii-main">

          {/* Título + periodo */}
          <section className="sii-page-header">
            <div>
              <p className="sii-page-header__eyebrow">SII ITC · Calificaciones</p>
              <h1 className="sii-page-header__title">
                {periodo?.descripcion_periodo ?? 'Período actual'}
              </h1>
              {periodo && (
                <p className="sii-page-header__sub">
                  Clave {periodo.clave_periodo} · {periodo.anio}
                </p>
              )}
            </div>
            <div className="sii-view-toggle">
              <button
                className={`sii-view-btn${view === 'tabla' ? ' sii-view-btn--active' : ''}`}
                onClick={() => setView('tabla')}
              >
                Tabla
              </button>
              <button
                className={`sii-view-btn${view === 'tarjetas' ? ' sii-view-btn--active' : ''}`}
                onClick={() => setView('tarjetas')}
              >
                Tarjetas
              </button>
            </div>
          </section>

          <div className="sii-divider" />

          {/* Stats */}
          <section className="sii-stats-grid">
            <div className="sii-bigstat sii-bigstat--accent">
              <span className="sii-bigstat__num">{stats.promedio}</span>
              <span className="sii-bigstat__label">Promedio general</span>
              <span className="sii-bigstat__sub">parciales con calificación</span>
            </div>
            <div className="sii-bigstat">
              <span className="sii-bigstat__num sii-bigstat__num--good">{stats.aprobadas}</span>
              <span className="sii-bigstat__label">En aprobación</span>
              <span className="sii-bigstat__sub">promedio parcial ≥ 70</span>
            </div>
            <div className="sii-bigstat">
              <span className="sii-bigstat__num sii-bigstat__num--bad">{stats.reprobadas}</span>
              <span className="sii-bigstat__label">En riesgo</span>
              <span className="sii-bigstat__sub">promedio parcial &lt; 70</span>
            </div>
            <div className="sii-bigstat">
              <span className="sii-bigstat__num">{materias.length}</span>
              <span className="sii-bigstat__label">Materias</span>
              <span className="sii-bigstat__sub">inscritas este período</span>
            </div>
          </section>

          <div className="sii-divider" />

          {/* Búsqueda */}
          <div className="sii-controls">
            <div className="sii-search-wrap">
              <svg className="sii-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="sii-search"
                placeholder="Buscar por nombre o clave de materia…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="sii-search-clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>
          </div>

          {/* Sin resultados */}
          {filtered.length === 0 && (
            <div className="sii-empty">
              <p>No se encontraron materias con ese criterio.</p>
            </div>
          )}

          {/* ══ VISTA TABLA ══ */}
          {view === 'tabla' && filtered.length > 0 && (
            <div className="sii-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="sii-table">
                <thead>
                  <tr>
                    <th className="sii-th">Materia</th>
                    <th className="sii-th">Clave</th>
                    <th className="sii-th">Grupo</th>
                    <th className="sii-th sii-th--center">P1</th>
                    <th className="sii-th sii-th--center">P2</th>
                    <th className="sii-th sii-th--center">P3</th>
                    <th className="sii-th sii-th--center">P4</th>
                    <th className="sii-th sii-th--center">Promedio</th>
                    <th className="sii-th sii-th--center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => {
                    const mat     = m.materia ?? {}
                    const califs  = m.calificaiones ?? []
                    const promedio = calcPromedio(califs)
                    return (
                      <tr key={i} className="sii-tr">
                        <td className="sii-td sii-td--name">{mat.nombre_materia ?? '—'}</td>
                        <td className="sii-td sii-td--muted">{mat.clave_materia ?? '—'}</td>
                        <td className="sii-td sii-td--muted">{mat.letra_grupo ?? '—'}</td>
                        {[1, 2, 3, 4].map(n => {
                          const c = califs.find(c => c.numero_calificacion === n)
                          return (
                            <td key={n} className="sii-td sii-td--center">
                              <GradeBadge value={c?.calificacion ?? null} />
                            </td>
                          )
                        })}
                        <td className="sii-td sii-td--center">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                            <GradeBadge value={promedio} />
                            {promedio && <GradeBar value={promedio} />}
                          </div>
                        </td>
                        <td className="sii-td sii-td--center">
                          <span className={`sii-estado sii-estado--${gradeClass(promedio)}`}>
                            {gradeLabel(promedio)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ══ VISTA TARJETAS ══ */}
          {view === 'tarjetas' && filtered.length > 0 && (
            <div className="sii-cards-grid">
              {filtered.map((m, i) => {
                const mat      = m.materia ?? {}
                const califs   = m.calificaiones ?? []
                const promedio = calcPromedio(califs)
                const cls      = gradeClass(promedio)
                return (
                  <div key={i} className={`sii-card sii-card--${cls}`}>
                    <div className="sii-card__top">
                      <span className="sii-card__clave">{mat.clave_materia} · Gpo {mat.letra_grupo}</span>
                      <GradeBadge value={promedio} />
                    </div>
                    <h3 className="sii-card__nombre">{mat.nombre_materia}</h3>

                    {/* Parciales */}
                    <div className="sii-card__parciales">
                      {[1, 2, 3, 4].map(n => {
                        const c = califs.find(c => c.numero_calificacion === n)
                        return (
                          <div key={n} className="sii-card__parcial">
                            <span className="sii-card__parcial-label">P{n}</span>
                            <GradeBadge value={c?.calificacion ?? null} />
                          </div>
                        )
                      })}
                    </div>

                    {promedio && <GradeBar value={promedio} />}
                    <div className="sii-card__footer">
                      <span className={`sii-estado sii-estado--${cls}`}>{gradeLabel(promedio)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <p className="sii-results-count">
            Mostrando <strong>{filtered.length}</strong> de <strong>{materias.length}</strong> materias
          </p>

        </main>

        <footer className="sii-footer">
          <span>Tecnológico Nacional de México · Campus Celaya</span>
          <span>Sistema de Información Institucional · {new Date().getFullYear()}</span>
        </footer>
      </div>
    </>
  )
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink:      #0f172a;
  --ink-2:    #334155;
  --ink-3:    #64748b;
  --rule:     #e2e8f0;
  --accent:   #2563eb;
  --accent-l: #eff6ff;
  --green:    #16a34a;
  --green-l:  #ecfdf5;
  --red:      #dc2626;
  --red-l:    #fef2f2;
  --amber:    #d97706;
  --amber-l:  #fffbeb;
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --radius: 20px;
}

body {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e40af 45%, #4338ca 100%);
  color: var(--ink);
  font-family: var(--font-sans);
}

.sii-shell {
  min-height: 100vh;
  display: flex; flex-direction: column; align-items: center;
  padding: 2rem 1rem 3rem; gap: 2rem;
}

/* Header */
.sii-header {
  width: min(1200px, 100%);
  display: flex; align-items: center; gap: 1.5rem;
  background: rgba(255,255,255,0.9);
  border-radius: 28px; padding: 1rem 1.5rem;
  box-shadow: 0 18px 50px rgba(15,23,42,0.12);
  backdrop-filter: blur(10px);
}
.sii-header__wordmark {
  font-family: var(--font-sans); font-size: 1rem; letter-spacing: .08em;
  color: var(--ink); text-transform: uppercase; font-weight: 800; white-space: nowrap;
}
.sii-header__wordmark span { color: var(--accent); }
.sii-header__nav   { display: flex; align-items: center; gap: .5rem; flex: 1; }
.sii-header__right { display: flex; align-items: center; gap: .75rem; margin-left: auto; }
.sii-header__link {
  background: rgba(37,99,235,0.08); border: none; cursor: pointer;
  font-family: var(--font-sans); font-size: .85rem; font-weight: 600; color: var(--ink-2);
  padding: .6rem 1rem; border-radius: 999px; transition: all .15s;
}
.sii-header__link:hover { background: rgba(37,99,235,0.16); transform: translateY(-1px); }
.sii-header__link--active { background: var(--accent); color: white !important; }
.sii-header__logout {
  display: inline-flex; align-items: center; gap: .4rem;
  background: var(--accent); border: none; cursor: pointer;
  font-family: var(--font-sans); font-size: .78rem; font-weight: 700;
  color: white; padding: .65rem 1rem; border-radius: 999px; transition: all .15s;
}
.sii-header__logout:hover { background: #1d4ed8; transform: translateY(-1px); }

/* Main */
.sii-main {
  flex: 1; width: min(1200px, 100%);
  padding: 2.2rem 2rem 3rem;
  display: flex; flex-direction: column; gap: 2rem;
  background: white; border-radius: 32px;
  border: 1px solid rgba(226,232,240,0.75);
  box-shadow: 0 28px 70px rgba(15,23,42,0.12);
}

.sii-divider { height: 1px; background: var(--rule); }

/* Page header */
.sii-page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 1rem;
}
.sii-page-header__eyebrow {
  font-size: .72rem; font-weight: 500; color: var(--ink-3);
  letter-spacing: .06em; text-transform: uppercase; margin-bottom: .3rem;
}
.sii-page-header__title {
  font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700;
  color: var(--ink); letter-spacing: -.01em; line-height: 1.1;
}
.sii-page-header__sub { font-size: .82rem; color: var(--ink-3); margin-top: .3rem; }

/* View toggle */
.sii-view-toggle { display: flex; gap: .4rem; margin-top: .3rem; }
.sii-view-btn {
  font-family: var(--font-sans); font-size: .8rem; font-weight: 600;
  background: #f1f5f9; border: 1px solid var(--rule); color: var(--ink-2);
  padding: .55rem 1rem; border-radius: 999px; cursor: pointer; transition: all .15s;
}
.sii-view-btn:hover { background: var(--accent-l); color: var(--accent); border-color: var(--accent); }
.sii-view-btn--active { background: var(--accent); color: white; border-color: var(--accent); }

/* Stats */
.sii-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
.sii-bigstat {
  padding: 1.5rem 1.25rem; background: #f8fafc;
  border: 1px solid rgba(226,232,240,0.9);
  border-radius: 24px; display: flex; flex-direction: column; gap: .4rem;
}
.sii-bigstat--accent { background: var(--accent-l); }
.sii-bigstat__num {
  font-size: clamp(1.8rem, 2.5vw, 2.6rem);
  line-height: 1; color: var(--ink); letter-spacing: -.01em;
}
.sii-bigstat--accent .sii-bigstat__num { color: var(--accent); }
.sii-bigstat__num--good { color: var(--green); }
.sii-bigstat__num--bad  { color: var(--red); }
.sii-bigstat__label { font-size: .72rem; font-weight: 600; color: var(--ink-2); text-transform: uppercase; letter-spacing: .05em; }
.sii-bigstat__sub   { font-size: .7rem; color: var(--ink-3); font-style: italic; }

/* Controls */
.sii-controls { display: flex; gap: .75rem; flex-wrap: wrap; }
.sii-search-wrap { flex: 1; min-width: 200px; position: relative; display: flex; align-items: center; }
.sii-search-icon { position: absolute; left: .9rem; color: var(--ink-3); pointer-events: none; }
.sii-search {
  width: 100%; background: #f8fafc; border: 1px solid var(--rule);
  border-radius: 999px; color: var(--ink);
  font-family: var(--font-sans); font-size: .9rem;
  padding: .7rem 2.5rem .7rem 2.5rem; outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.sii-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.sii-search::placeholder { color: var(--ink-3); }
.sii-search-clear {
  position: absolute; right: .85rem;
  background: none; border: none; color: var(--ink-3); cursor: pointer;
}

/* Empty */
.sii-empty { display: flex; align-items: center; justify-content: center; padding: 3rem 0; color: var(--ink-3); }

/* Panel */
.sii-panel {
  background: #fff; border: 1px solid rgba(226,232,240,0.9);
  border-radius: 28px; box-shadow: 0 18px 45px rgba(15,23,42,0.07);
}

/* Table */
.sii-table { width: 100%; border-collapse: collapse; }
.sii-th {
  font-size: .7rem; font-weight: 600; color: var(--ink-3);
  text-transform: uppercase; letter-spacing: .06em;
  padding: .9rem 1rem; text-align: left;
  background: #f8fafc; border-bottom: 1px solid var(--rule);
  white-space: nowrap;
}
.sii-th:first-child { border-radius: 28px 0 0 0; padding-left: 1.5rem; }
.sii-th:last-child  { border-radius: 0 28px 0 0; }
.sii-th--center { text-align: center; }
.sii-tr { border-bottom: 1px solid rgba(226,232,240,0.7); transition: background .12s; }
.sii-tr:last-child { border-bottom: none; }
.sii-tr:hover { background: #f8fafc; }
.sii-td { padding: .85rem 1rem; font-size: .86rem; vertical-align: middle; }
.sii-td:first-child { padding-left: 1.5rem; }
.sii-td--name  { font-weight: 500; color: var(--ink); max-width: 260px; }
.sii-td--muted { color: var(--ink-3); font-size: .8rem; }
.sii-td--center { text-align: center; }

/* Grade badge */
.sii-grade-badge {
  display: inline-block;
  font-size: .88rem; font-weight: 700;
  padding: .18rem .6rem; border-radius: 8px;
}
.sii-grade-badge--good { background: var(--green-l); color: var(--green); }
.sii-grade-badge--ok   { background: var(--accent-l); color: var(--accent); }
.sii-grade-badge--warn { background: var(--amber-l);  color: var(--amber); }
.sii-grade-badge--bad  { background: var(--red-l);    color: var(--red); }
.sii-grade-badge--na   { background: #f1f5f9; color: var(--ink-3); font-weight: 400; }

/* Grade bar */
.sii-bar__track {
  height: 5px; background: rgba(226,232,240,0.95);
  border-radius: 999px; overflow: hidden; width: 100%; min-width: 60px;
}
.sii-bar__fill { height: 100%; width: var(--pct); border-radius: 999px; transition: width .7s ease; }
.sii-bar__fill--good { background: var(--green); }
.sii-bar__fill--ok   { background: var(--accent); }
.sii-bar__fill--warn { background: var(--amber); }
.sii-bar__fill--bad  { background: var(--red); }
.sii-bar__fill--na   { background: var(--ink-3); }

/* Estado */
.sii-estado {
  font-size: .7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .05em;
  padding: .22rem .6rem; border-radius: 999px; white-space: nowrap;
}
.sii-estado--good { background: var(--green-l); color: var(--green); }
.sii-estado--ok   { background: var(--accent-l); color: var(--accent); }
.sii-estado--warn { background: var(--amber-l);  color: var(--amber); }
.sii-estado--bad  { background: var(--red-l);    color: var(--red); }
.sii-estado--na   { background: #f1f5f9; color: var(--ink-3); }

/* Cards */
.sii-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 1rem; }
.sii-card {
  background: #fff; border: 1px solid var(--rule); border-radius: 24px;
  padding: 1.25rem; display: flex; flex-direction: column; gap: .75rem;
  box-shadow: 0 4px 16px rgba(15,23,42,0.05);
  transition: transform .15s, box-shadow .15s;
}
.sii-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.1); }
.sii-card--good { border-color: rgba(22,163,74,0.25); }
.sii-card--ok   { border-color: rgba(37,99,235,0.25); }
.sii-card--warn { border-color: rgba(217,119,6,0.25); }
.sii-card--bad  { border-color: rgba(220,38,38,0.25); }
.sii-card--na   { border-color: var(--rule); }
.sii-card__top  { display: flex; justify-content: space-between; align-items: center; }
.sii-card__clave { font-size: .7rem; color: var(--ink-3); text-transform: uppercase; letter-spacing: .06em; }
.sii-card__nombre { font-size: .92rem; font-weight: 600; color: var(--ink); line-height: 1.35; }
.sii-card__parciales { display: grid; grid-template-columns: repeat(4,1fr); gap: .4rem; }
.sii-card__parcial { display: flex; flex-direction: column; align-items: center; gap: .25rem; }
.sii-card__parcial-label { font-size: .65rem; font-weight: 600; color: var(--ink-3); text-transform: uppercase; }
.sii-card__footer { display: flex; justify-content: flex-end; }

/* Results count */
.sii-results-count { font-size: .78rem; color: var(--ink-3); text-align: right; }
.sii-results-count strong { color: var(--ink-2); }

/* Loading / Error */
.sii-loading { display: flex; flex-direction: column; gap: .75rem; max-width: 500px; }
.sii-error   { display: flex; flex-direction: column; gap: 1rem; }
.sii-error__msg { font-size: .9rem; color: var(--red); }
.sii-btn {
  font-family: var(--font-sans); font-size: .88rem; font-weight: 700;
  color: white; background: var(--accent); border: none; cursor: pointer;
  padding: .85rem 1.4rem; border-radius: 999px; transition: all .15s;
}
.sii-btn:hover { background: #1d4ed8; transform: translateY(-1px); }

/* Footer */
.sii-footer {
  width: min(1200px, 100%);
  padding: .75rem 0;
  display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
  font-size: .7rem; color: rgba(255,255,255,0.45);
}

/* Skeleton */
.sii-skel {
  background: linear-gradient(90deg, var(--rule) 25%, #e4e4e7 50%, var(--rule) 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: var(--radius);
}
@keyframes shimmer { to { background-position: -200% 0; } }

/* Responsive */
@media (max-width: 720px) {
  .sii-main { padding: 1.5rem 1rem 2rem; }
  .sii-header__nav { display: none; }
  .sii-stats-grid { grid-template-columns: repeat(2,1fr); }
  .sii-footer { flex-direction: column; align-items: center; text-align: center; }
}
`