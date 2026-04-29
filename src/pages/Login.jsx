import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoTecnm from '../assets/logo.png'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const { login, loading } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!email || !password) {
            setError('Por favor, ingresa todos los campos.')
            return
        }

        const res = await login(email, password)
        if (res.ok) {
            navigate('/dashboard', { replace: true })
        } else {
            setError(res.message)
        }
    }

    return (
        <div className="sii-login-wrap">
            <div className="sii-login-card">
                <div className="sii-login-brand">
                    <img src={logoTecnm} alt="Logo Institucional" className="sii-login-logo" />
                    <h1 className="sii-login-title">SII<span>ITC</span></h1>
                    <p className="sii-login-sub">Sistema de Información Institucional</p>
                </div>

                <form className="sii-login-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="sii-login-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="sii-input-group">
                        <label className="sii-label" htmlFor="email">Correo Institucional</label>
                        <input
                            id="email"
                            className="sii-input"
                            type="email"
                            placeholder="ejemplo@celaya.tecnm.mx"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="sii-input-group">
                        <label className="sii-label" htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            className="sii-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={`sii-btn sii-login-btn ${loading ? 'sii-btn--loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="sii-spinner"></span>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>

                <div className="sii-login-footer">
                    Tecnológico Nacional de México<br/>Campus Celaya
                </div>
            </div>
        </div>
    )
}