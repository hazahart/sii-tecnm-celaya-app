import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Kardex from './pages/Kardex'
import Horario from './pages/Horario'
import Calificaciones from './pages/Calificaciones'

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/kardex" element={
                <ProtectedRoute>
                    <Layout>
                        <Kardex />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/horario" element={
                <ProtectedRoute>
                    <Layout>
                        <Horario />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/calificaciones" element={
                <ProtectedRoute>
                    <Layout>
                        <Calificaciones />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App