import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEstudiante } from '../api/endpoints'

function Bar({ label, value, max = 100, unit = '%' }) {
  const pct = Math.min(((parseFloat(value) || 0) / max) * 100, 100)
  return (
    <div className="sii-bar">
      <div className="sii-bar__header">
        <span className="sii-bar__label">{label}</span>
        <span className="sii-bar__value">{parseFloat(value).toFixed(1)}{unit !== '%' ? ` ${unit}` : '%'}</span>
      </div>
      <div className="sii-bar__track">
        <div className="sii-bar__fill" style={{ '--pct': `${pct}%` }} />
      </div>
    </div>
  )
}

function BigStat({ value, label, sub, accent = false }) {
  return (
    <div className={`sii-bigstat${accent ? ' sii-bigstat--accent' : ''}`}>
      <span className="sii-bigstat__num">{value}</span>
      <span className="sii-bigstat__label">{label}</span>
      {sub && <span className="sii-bigstat__sub">{sub}</span>}
    </div>
  )
}

function DataRow({ label, value }) {
  return (
    <div className="sii-row">
      <span className="sii-row__label">{label}</span>
      <span className="sii-row__value">{value}</span>
    </div>
  )
}

function Skel({ w = '100%', h = '1rem' }) {
  return <span className="sii-skel" style={{ width: w, height: h, display: 'block' }} />
}

export default function Dashboard() {
  const { isAuth } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgErr, setImgErr] = useState(false)

  useEffect(() => {
    if (!isAuth) { navigate('/login', { replace: true }); return }
    getEstudiante()
      .then(res => setData(res.data ?? res))
      .catch(err => {
        if (err.response?.status === 401) navigate('/login', { replace: true })
        else setError('No se pudo obtener la información del servidor.')
      })
      .finally(() => setLoading(false))
  }, [isAuth, navigate])

  if (loading) return (
    <main className="sii-main">
      <div className="sii-loading">
        <Skel w="260px" h="2.2rem" />
        <Skel w="180px" h="1rem" />
        <br />
        <Skel w="100%" h="1px" />
        <br />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' }}>
          {[...Array(4)].map((_, i) => <Skel key={i} w="100%" h="5rem" />)}
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

  if (!data) return null

  const d = data
  const pond = parseFloat(d.promedio_ponderado ?? 0)
  const arit = parseFloat(d.promedio_aritmetico ?? 0)
  const avance = d.porcentaje_avance ?? 0
  const cursando = d.percentaje_avance_cursando ?? 0
  const nombre = d.persona ?? ''
  const initials = nombre.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('')
  const pondClass = pond >= 90 ? 'good' : pond >= 80 ? 'ok' : pond >= 70 ? 'warn' : 'bad'

  return (
    <main className="sii-main">
      <section className="sii-identity">
        <div className="sii-identity__avatar">
          {d.foto && !imgErr
            ? <img src={`data:image/jpeg;base64,${d.foto}`} alt="Foto" onError={() => setImgErr(true)} />
            : <span>{initials}</span>}
        </div>
        <div className="sii-identity__info">
          <p className="sii-identity__eyebrow">Semestre {d.semestre} · {d.numero_control}</p>
          <h1 className="sii-identity__name">{nombre}</h1>
          <p className="sii-identity__email">{d.email}</p>
        </div>
        <div className={`sii-identity__gpa sii-identity__gpa--${pondClass}`}>
          <span className="sii-identity__gpa-num">{pond.toFixed(2)}</span>
          <span className="sii-identity__gpa-label">Promedio<br />ponderado</span>
        </div>
      </section>

      <div className="sii-divider" />

      <section className="sii-stats-grid">
        <BigStat value={pond.toFixed(1)} label="Prom. ponderado" sub="sobre 100" accent />
        <BigStat value={arit.toFixed(1)} label="Prom. aritmético" sub="sobre 100" />
        <BigStat value={d.creditos_acumulados} label="Créditos acum." sub={`+${d.creditos_complementarios ?? 0} comp.`} />
        <BigStat value={`${avance}%`} label="Avance carrera" sub={`${cursando}% cursando`} />
      </section>

      <div className="sii-divider" />

      <section className="sii-two-col">
        <div className="sii-panel">
          <h2 className="sii-panel__title">Materias</h2>
          <div className="sii-pills-row">
            <div className="sii-pill sii-pill--green">
              <span className="sii-pill__num">{d.materias_aprobadas}</span>
              <span className="sii-pill__label">Aprobadas</span>
            </div>
            <div className="sii-pill sii-pill--red">
              <span className="sii-pill__num">{d.materias_reprobadas}</span>
              <span className="sii-pill__label">Reprobadas</span>
            </div>
            <div className="sii-pill sii-pill--amber">
              <span className="sii-pill__num">{d.num_mat_rep_no_acreditadas ?? 0}</span>
              <span className="sii-pill__label">No acred.</span>
            </div>
          </div>
          <div className="sii-distrib">
            <div className="sii-distrib__seg sii-distrib__seg--green" style={{ flex: d.materias_aprobadas }} title={`${d.materias_aprobadas} aprobadas`} />
            <div className="sii-distrib__seg sii-distrib__seg--red" style={{ flex: d.materias_reprobadas }} title={`${d.materias_reprobadas} reprobadas`} />
            <div className="sii-distrib__seg sii-distrib__seg--amber" style={{ flex: (d.num_mat_rep_no_acreditadas ?? 0) || 0.5 }} title="No acreditadas" />
          </div>
          <p className="sii-distrib__legend">{d.materias_cursadas} materias cursadas en total</p>
        </div>

        <div className="sii-panel">
          <h2 className="sii-panel__title">Avance académico</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', marginTop: '0.5rem' }}>
            <Bar label="Avance de carrera" value={avance} />
            <Bar label="Avance cursando" value={cursando} />
            <Bar label="Promedio ponderado" value={pond} />
            <Bar label="Promedio aritmético" value={arit} />
          </div>
        </div>
      </section>

      <div className="sii-divider" />

      <section className="sii-panel">
        <h2 className="sii-panel__title">Datos del expediente</h2>
        <div className="sii-datatable">
          <DataRow label="Nombre completo" value={d.persona} />
          <DataRow label="Número de control" value={d.numero_control} />
          <DataRow label="Correo institucional" value={d.email} />
          <DataRow label="Semestre" value={`${d.semestre}°`} />
          <DataRow label="Créditos acumulados" value={d.creditos_acumulados} />
          <DataRow label="Créditos complementarios" value={d.creditos_complementarios ?? 0} />
          <DataRow label="Materias cursadas" value={d.materias_cursadas} />
          <DataRow label="Materias aprobadas" value={d.materias_aprobadas} />
          <DataRow label="Materias reprobadas" value={d.materias_reprobadas} />
          <DataRow label="Rep. no acreditadas" value={d.num_mat_rep_no_acreditadas ?? 0} />
          <DataRow label="Promedio ponderado" value={pond.toFixed(4)} />
          <DataRow label="Promedio aritmético" value={arit.toFixed(4)} />
          <DataRow label="Avance general" value={`${avance}%`} />
          <DataRow label="Avance cursando" value={`${cursando}%`} />
        </div>
      </section>
    </main>
  )
}