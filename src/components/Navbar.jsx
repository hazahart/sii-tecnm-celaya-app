import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEstudiante } from '../api/endpoints'

export default function Navbar() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [numeroControl, setNumeroControl] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        getEstudiante()
            .then(res => {
                const data = res.data ?? res
                setNumeroControl(data.numero_control || '')
            })
            .catch(() => { })
    }, [])

    useEffect(() => {
        setMenuOpen(false)
    }, [location.pathname])

    const handleLogout = () => {
        logout()
        navigate('/login', { replace: true })
    }

    const nav = [
        { label: 'Calificaciones', path: '/calificaciones' },
        { label: 'Kardex', path: '/kardex' },
        { label: 'Horario', path: '/horario' },
        { label: 'Simulador', path: '/simulador' }
    ]

    return (
        <header className="sii-header" style={{ position: 'relative' }}>
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
                {nav.map(({ label, path }) => {
                    const isActive = location.pathname === path
                    return (
                        <button
                            key={label}
                            className={`sii-header__link ${isActive ? 'sii-header__link--active' : ''}`}
                            onClick={() => navigate(path)}
                        >
                            {label}
                        </button>
                    )
                })}
            </nav>

            <div className="sii-header__right">
                <span className="sii-header__ctrl">{numeroControl}</span>

                <button
                    className="sii-mobile-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {menuOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </>
                        )}
                    </svg>
                </button>

                <button className="sii-header__logout" onClick={handleLogout} title="Cerrar sesión">
                    <span className="sii-logout-text">Cerrar sesión</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>

            {menuOpen && (
                <div className="sii-mobile-menu">
                    {nav.map(({ label, path }) => {
                        const isActive = location.pathname === path
                        return (
                            <button
                                key={label}
                                className={`sii-mobile-link ${isActive ? 'sii-mobile-link--active' : ''}`}
                                onClick={() => navigate(path)}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
            )}
        </header>
    )
}