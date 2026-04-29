import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Kardex from './pages/Kardex'
import Horario from './pages/Horario'

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/kardex" element={
                <ProtectedRoute><Kardex /></ProtectedRoute>
            } />
            <Route path="/horario" element={
                <ProtectedRoute><Horario /></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App