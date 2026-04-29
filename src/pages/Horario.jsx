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
    const { isAuth } = useAuth()
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

    if (loading) return (
        <main className="sii-main">
            <div className="sii-loading">
                <Skel w="200px" h="2rem" />
                <Skel w="150px" h="1rem" />
                <br />
                <Skel w="100%" h="200px" />
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

    if (!raw) return null

    const periodo = raw.periodo
    const clases = raw.horario ?? []
    const hoy = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][new Date().getDay()]

    return (
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
                            <div className="sii-agenda__materia" style={{ borderLeftColor: color.border }}>
                                <span className="sii-agenda__mat-nombre">{clase.nombre_materia}</span>
                                <span className="sii-agenda__mat-clave">
                                    {clase.clave_materia} · Gpo {clase.letra_grupo}
                                </span>
                            </div>

                            {DIAS.map(({ key }) => {
                                const hora = clase[key]
                                const salon = clase[`${key}_clave_salon`]
                                const esHoy = hoy === key
                                return (
                                    <div key={key} className={`sii-agenda__cell ${esHoy ? 'sii-agenda__cell--hoy' : ''}`}>
                                        {hora ? (
                                            <div
                                                className="sii-clase-chip"
                                                style={{ background: color.bg, borderColor: color.border, color: color.text }}
                                            >
                                                <span className="sii-clase-chip__hora">{hora}</span>
                                                {salon && <span className="sii-clase-chip__salon">{salon}</span>}
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
                            <div key={clase.id_grupo} className="sii-clase-card" style={{ borderLeftColor: color.border }}>
                                <div className="sii-clase-card__head">
                                    <span className="sii-clase-card__nombre">{clase.nombre_materia}</span>
                                    <span className="sii-clase-card__clave">{clase.clave_materia}</span>
                                </div>
                                <div className="sii-clase-card__dias">
                                    {diasCon.map(({ key, label }) => (
                                        <div key={key} className="sii-clase-dia">
                                            <span className="sii-clase-dia__label" style={{ color: color.text }}>{label}</span>
                                            <span className="sii-clase-dia__hora">{clase[key]}</span>
                                            {clase[`${key}_clave_salon`] && (
                                                <span className="sii-clase-dia__salon">{clase[`${key}_clave_salon`]}</span>
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
    )
}