import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_SIMULATOR_API

export default function Admin() {
    const [criterios, setCriterios] = useState([])
    const [loading, setLoading] = useState(true)
    const [clave, setClave] = useState('')
    const [nombre, setNombre] = useState('')
    const [parcial, setParcial] = useState(1)
    const [items, setItems] = useState([{ nombre: '', peso: 0 }])
    const [msg, setMsg] = useState(null)
    const [editando, setEditando] = useState(null)

    useEffect(() => { cargar() }, [])

    async function cargar() {
        setLoading(true)
        try {
            const res = await fetch(`${API}/criterios`)
            const data = await res.json()
            setCriterios(data)
        } catch {
            setCriterios([])
        } finally {
            setLoading(false)
        }
    }

    function addItem() {
        setItems(prev => [...prev, { nombre: '', peso: 0 }])
    }

    function removeItem(i) {
        setItems(prev => prev.filter((_, idx) => idx !== i))
    }

    function updateItem(i, field, value) {
        setItems(prev => prev.map((item, idx) =>
            idx === i ? { ...item, [field]: field === 'peso' ? parseFloat(value) || 0 : value } : item
        ))
    }

    function totalPeso() {
        return items.reduce((s, i) => s + (i.peso || 0), 0)
    }

    function limpiar() {
        setClave('')
        setNombre('')
        setParcial(1)
        setItems([{ nombre: '', peso: 0 }])
        setEditando(null)
    }

    function showMsg(text, ok) {
        setMsg({ text, ok })
        setTimeout(() => setMsg(null), 3000)
    }

    async function guardar() {
        if (!clave.trim()) return showMsg('La clave es obligatoria', false)
        if (Math.abs(totalPeso() - 100) > 0.01) return showMsg('Los pesos deben sumar 100', false)
        try {
            const res = await fetch(`${API}/criterios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clave_materia: clave.trim(),
                    nombre_materia: nombre.trim() || clave.trim(),
                    numero_parcial: parcial,
                    items,
                })
            })
            const data = await res.json()
            if (data.error) return showMsg(data.error, false)
            showMsg('Guardado correctamente', true)
            limpiar()
            cargar()
        } catch {
            showMsg('Error al conectar con el servidor', false)
        }
    }

    function editar(m) {
        setClave(m.clave_materia)
        setNombre(m.nombre_materia)
        setParcial(m.numero_parcial)
        setItems(m.items)
        setEditando(m.id)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const total = totalPeso()
    const totalOk = Math.abs(total - 100) < 0.01

    return (
        <main className="sii-main">
            <style>{`
                .admin-input {
                    width: 100%;
                    padding: 0.6rem 0.9rem;
                    background: #f8fafc;
                    border: 1.5px solid var(--rule);
                    border-radius: 10px;
                    color: var(--ink);
                    font-size: 0.9rem;
                    font-family: var(--font-sans);
                    transition: border-color .15s;
                }
                .admin-input:focus {
                    outline: none;
                    border-color: var(--accent);
                }
                .parcial-btn-admin {
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
                .parcial-btn-admin.active {
                    border-color: var(--accent);
                    background: var(--accent-l);
                    color: var(--accent);
                    font-weight: 700;
                }
            `}</style>

            <section className="sii-page-header">
                <div>
                    <p className="sii-page-header__eyebrow">SII ITC · Admin</p>
                    <h1 className="sii-page-header__title">Panel de Administración</h1>
                    <p className="sii-page-header__sub">Configura los criterios de evaluación por materia y parcial</p>
                </div>
            </section>

            <div className="sii-divider" />

            {msg && (
                <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    background: msg.ok ? 'var(--green-l)' : 'var(--red-l)',
                    border: `1px solid ${msg.ok ? 'var(--green)' : 'var(--red)'}`,
                    color: msg.ok ? 'var(--green)' : 'var(--red)',
                    fontWeight: 600,
                }}>
                    {msg.text}
                </div>
            )}

            <div className="sii-panel" style={{ marginBottom: '1.5rem' }}>
                <p className="sii-section-title">
                    {editando ? 'Editando criterios' : 'Agregar criterios'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--ink-3)', display: 'block', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                            Clave de materia *
                        </label>
                        <input
                            value={clave}
                            onChange={e => setClave(e.target.value)}
                            placeholder="Ej. ACA-0909"
                            className="admin-input"
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--ink-3)', display: 'block', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                            Nombre de materia
                        </label>
                        <input
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            placeholder="Ej. Taller de Investigación I"
                            className="admin-input"
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--ink-3)', display: 'block', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                        Parcial
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[1, 2, 3, 4].map(n => (
                            <button
                                key={n}
                                onClick={() => setParcial(n)}
                                className={`parcial-btn-admin ${parcial === n ? 'active' : ''}`}
                            >
                                Parcial {n}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                            Criterios de evaluación
                        </label>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: totalOk ? 'var(--green)' : 'var(--red)' }}>
                            Total: {total}%
                        </span>
                    </div>

                    <div style={{ border: '1px solid var(--rule)', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 36px', gap: '0', background: '#f8fafc', padding: '0.6rem 1rem', borderBottom: '1px solid var(--rule)' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Criterio</p>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'center' }}>Peso %</p>
                            <p></p>
                        </div>

                        {items.map((item, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 100px 36px',
                                    gap: '0.5rem',
                                    padding: '0.6rem 1rem',
                                    borderBottom: i < items.length - 1 ? '1px solid var(--rule)' : 'none',
                                    alignItems: 'center',
                                    background: '#fff',
                                }}
                            >
                                <input
                                    value={item.nombre}
                                    onChange={e => updateItem(i, 'nombre', e.target.value)}
                                    placeholder="Ej. Examen"
                                    className="admin-input"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={item.peso}
                                    onChange={e => updateItem(i, 'peso', e.target.value)}
                                    placeholder="%"
                                    className="admin-input"
                                    style={{ textAlign: 'center' }}
                                />
                                <button
                                    onClick={() => removeItem(i)}
                                    style={{
                                        background: 'var(--red-l)',
                                        border: '1px solid var(--red)',
                                        borderRadius: '8px',
                                        color: 'var(--red)',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        lineHeight: 1,
                                        padding: '0.35rem',
                                        width: '100%',
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addItem}
                        style={{
                            marginTop: '0.5rem',
                            width: '100%',
                            padding: '0.5rem',
                            background: 'none',
                            border: '1.5px dashed var(--rule)',
                            borderRadius: '10px',
                            color: 'var(--ink-3)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontFamily: 'var(--font-sans)',
                            transition: 'border-color .15s, color .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink-3)' }}
                    >
                        + Agregar criterio
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="sii-btn" onClick={guardar}>
                        {editando ? 'Guardar cambios' : 'Guardar'}
                    </button>
                    {editando && (
                        <button
                            className="sii-btn"
                            onClick={limpiar}
                            style={{ background: '#f8fafc', color: 'var(--ink-3)', border: '1px solid var(--rule)' }}
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </div>

            <div className="sii-divider" />

            <section style={{ marginTop: '1.5rem' }}>
                <p className="sii-section-title">Criterios configurados</p>

                {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[...Array(3)].map((_, i) => (
                            <span key={i} className="sii-skel" style={{ height: '4rem', display: 'block', borderRadius: '16px' }} />
                        ))}
                    </div>
                )}

                {!loading && !criterios.length && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-3)', fontSize: '0.88rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--rule)' }}>
                        No hay criterios configurados aún.
                    </div>
                )}

                {!loading && criterios.map((m, i) => (
                    <div key={i} className="sii-panel" style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>{m.nombre_materia}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--ink-3)', marginTop: '0.15rem' }}>
                                    {m.clave_materia} · Parcial {m.numero_parcial}
                                </p>
                            </div>
                            <button className="sii-btn" onClick={() => editar(m)}>Editar</button>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                            {m.items.map((item, j) => (
                                <span key={j} style={{
                                    background: 'var(--accent-l)',
                                    border: '1px solid var(--rule)',
                                    borderRadius: '999px',
                                    padding: '0.2rem 0.7rem',
                                    fontSize: '0.78rem',
                                    color: 'var(--accent)',
                                    fontWeight: 600,
                                }}>
                                    {item.nombre} · {item.peso}%
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </main>
    )
}