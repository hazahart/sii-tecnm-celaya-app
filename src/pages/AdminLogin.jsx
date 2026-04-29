import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_SIMULATOR_API

export default function AdminLogin() {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    async function handleLogin() {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            })
            const data = await res.json()
            if (!data.ok) {
                setError('Contraseña incorrecta')
                return
            }
            sessionStorage.setItem('isAdmin', 'true')
            navigate('/admin')
        } catch {
            setError('No se pudo conectar con el servidor')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sii-bg)' }}>
            <div className="sii-panel" style={{ width: '100%', maxWidth: '380px' }}>
                <p className="sii-page-header__eyebrow" style={{ marginBottom: '0.25rem' }}>SII ITC · Admin</p>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>Acceso de profesor</h1>

                {error && (
                    <div style={{ padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.83rem', background: '#7f1d1d22', border: '1px solid #ef444433', color: '#fca5a5' }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--sii-text-muted)', display: 'block', marginBottom: '4px' }}>
                        Contraseña
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        placeholder="Contraseña de administrador"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--sii-bg)', border: '1px solid var(--sii-border)', borderRadius: '8px', color: 'var(--sii-text)', fontSize: '0.9rem' }}
                    />
                </div>

                <button className="sii-btn" onClick={handleLogin} disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Verificando...' : 'Entrar'}
                </button>
            </div>
        </main>
    )
}