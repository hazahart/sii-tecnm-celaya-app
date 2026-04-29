const API = import.meta.env.VITE_SIMULATOR_API

export const getCriterios = async (clave, parcial) => {
    const res = await fetch(`${API}/criterios/${clave}/${parcial}`)
    if (!res.ok) throw new Error('Error al obtener criterios')
    return res.json()
}

export const getEscenarios = async (matricula) => {
    const res = await fetch(`${API}/escenarios/${matricula}`)
    if (!res.ok) throw new Error('Error al obtener escenarios')
    return res.json()
}

export const saveEscenario = async (matricula, nombre, data) => {
    const res = await fetch(`${API}/escenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula, nombre, data }),
    })
    if (!res.ok) throw new Error('Error al guardar escenario')
    return res.json()
}

export const deleteEscenario = async (id) => {
    const res = await fetch(`${API}/escenarios/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error al eliminar escenario')
    return res.json()
}