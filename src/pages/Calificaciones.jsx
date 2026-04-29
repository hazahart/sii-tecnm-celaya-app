import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCalificaciones } from '../api/endpoints'

function Skel({ w = '100%', h = '1rem' }) {
  return <span className="sii-skel" style={{ width: w, height: h, display: 'block' }} />
}

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

function calcPromedio(calificaciones) {
  const vals = (calificaciones ?? [])
    .map(c => parseFloat(c.calificacion))
    .filter(n => !isNaN(n))
  if (!vals.length) return null
  return (vals.reduce((s, n) => s + n, 0) / vals.length).toFixed(1)
}

function GradeBadge({ value }) {
  const cls = gradeClass(value)
  const display = value === null || value === undefined ? 'S/C' : value
  return <span className={`sii-grade-badge sii-grade-badge--${cls}`}>{display}</span>
}

function GradeBar({ value }) {
  const pct = Math.min(parseFloat(value) || 0, 100)
  const cls = gradeClass(value)
  return (
    <div className="sii-bar__track">
      <div className={`sii-bar__fill sii-bar__fill--${cls}`} style={{ '--pct': `${pct}%` }} />
    </div>
  )
}

export default function Calificaciones() {
  const { isAuth } = useAuth()
  const navigate = useNavigate()

  const [periodo, setPeriodo] = useState(null)
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('tabla')

  useEffect(() => {
    if (!isAuth) { navigate('/login', { replace: true }); return }
    getCalificaciones()
      .then(res => {
        const payload = (res.data ?? res)[0]
        setPeriodo(payload.periodo ?? null)
        setMaterias(payload.materias ?? [])
      })
      .catch(err => {
        if (err.response?.status === 401) navigate('/login', { replace: true })
        else setError('No se pudieron obtener las calificaciones.')
      })
      .finally(() => setLoading(false))
  }, [isAuth, navigate])

  const filtered = useMemo(() => {
    if (!search.trim()) return materias
    const q = search.toLowerCase()
    return materias.filter(m =>
      (m.materia?.nombre_materia ?? '').toLowerCase().includes(q) ||
      (m.materia?.clave_materia ?? '').toLowerCase().includes(q)
    )
  }, [materias, search])

  const stats = useMemo(() => {
    const promedios = materias
      .map(m => parseFloat(calcPromedio(m.calificaiones)))
      .filter(n => !isNaN(n))
    if (!promedios.length) return { promedio: '—', aprobadas: 0, reprobadas: 0, pendientes: 0 }
    return {
      promedio: (promedios.reduce((s, n) => s + n, 0) / promedios.length).toFixed(1),
      aprobadas: promedios.filter(n => n >= 70).length,
      reprobadas: promedios.filter(n => n < 70).length,
      pendientes: materias.filter(m => calcPromedio(m.calificaiones) === null).length,
    }
  }, [materias])

  if (loading) return (
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

      <div className="sii-controls">
        <div className="sii-search-wrap">
          <svg className="sii-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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

      {filtered.length === 0 && (
        <div className="sii-empty">
          <p>No se encontraron materias con ese criterio.</p>
        </div>
      )}

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
                const mat = m.materia ?? {}
                const califs = m.calificaiones ?? []
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

      {view === 'tarjetas' && filtered.length > 0 && (
        <div className="sii-cards-grid">
          {filtered.map((m, i) => {
            const mat = m.materia ?? {}
            const califs = m.calificaiones ?? []
            const promedio = calcPromedio(califs)
            const cls = gradeClass(promedio)
            return (
              <div key={i} className={`sii-card sii-card--${cls}`}>
                <div className="sii-card__top">
                  <span className="sii-card__clave">{mat.clave_materia} · Gpo {mat.letra_grupo}</span>
                  <GradeBadge value={promedio} />
                </div>
                <h3 className="sii-card__nombre">{mat.nombre_materia}</h3>

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
  )
}