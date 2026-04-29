# Examen 3 de Tópicos Avanzados de Desarrollo Web
## SII ITC

Interfaz web para el Sistema de Información Institucional del TecNM Celaya. Permite a los estudiantes autenticarse y visualizar su información académica de forma dinámica, además de simular sus calificaciones por parcial.

## Demo

- **Frontend:** https://sii-tecnm-celaya-app.vercel.app
- **Backend:** https://sii-tecnm-celaya-backend.onrender.com

---

## Tecnologías

### Frontend
- React + Vite
- React Router
- Axios
- Recharts
- Tailwind CSS

### Backend
- Node.js + Express
- Supabase (PostgreSQL)
- Despliegue en Render

---

## Funcionalidades

### Módulos principales
1. **Autenticación** — Login con JWT, rutas protegidas y manejo de sesión
2. **Dashboard** — Vista principal con datos personales del estudiante e indicadores visuales
3. **Calificaciones** — Tabla y tarjetas con búsqueda en tiempo real y semáforo de desempeño
4. **Kardex y Horario** — Historial académico completo y clases organizadas por día y hora

### Funcionalidad adicional: Simulador de Calificaciones
Permite al estudiante seleccionar una materia y un parcial, ingresar su calificación en cada criterio de evaluación configurado por el profesor, y calcular automáticamente su nota del parcial en tiempo real.

- Los profesores configuran los criterios desde un **panel de administración** propio (`/admin`)
- Los criterios se guardan en Supabase
- Cada materia puede tener criterios distintos por parcial (Examen, Tareas, Prácticas, etc.)

---

## Instalación y ejecución

### Frontend

```bash
git clone https://github.com/hazahart/sii-tecnm-celaya-app
cd sii-tecnm-celaya-app
npm install
```

Crea un archivo `.env` en la raíz:

```
VITE_API_BASE_URL=https://sii.celaya.tecnm.mx/api
VITE_SIMULATOR_API=https://sii-tecnm-celaya-backend.onrender.com
```

```bash
npm run dev
```

### Backend

```bash
git clone https://github.com/hazahart/sii-tecnm-celaya-backend
cd sii-tecnm-celaya-backend
npm install
```

Crea un archivo `.env` en la raíz:

```
SUPABASE_URL=url_del_proyecto_supabase
SUPABASE_PUBLISHABLE_KEY=publishable_key
ADMIN_PASSWORD=contraseña_del_admin
PORT=3001
```

```bash
npm run dev
```

---

## Base de datos (Supabase)

Ejecuta este SQL en el editor de Supabase para crear las tablas:

```sql
CREATE TABLE criterios (
  id BIGSERIAL PRIMARY KEY,
  clave_materia TEXT NOT NULL,
  nombre_materia TEXT,
  numero_parcial INT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clave_materia, numero_parcial)
);

CREATE TABLE escenarios (
  id BIGSERIAL PRIMARY KEY,
  matricula TEXT NOT NULL,
  nombre TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Estructura del proyecto

### Frontend
```
src/
├── api/
│   ├── client.js              # Instancia de Axios con interceptores JWT
│   ├── endpoints.js           # Endpoints de la API del SII
│   ├── simuladorEndpoints.js  # Endpoints del backend propio
│   └── storage.js             # Manejo del token en localStorage
├── components/
│   ├── AdminRoute.jsx         # Protección de rutas del admin
│   ├── Navbar.jsx
│   ├── Layout.jsx
│   ├── Footer.jsx
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx        # Contexto global de autenticación
└── pages/
    ├── Login.jsx
    ├── Dashboard.jsx
    ├── Calificaciones.jsx
    ├── Kardex.jsx
    ├── Horario.jsx
    ├── Simulador.jsx
    ├── Admin.jsx
    └── AdminLogin.jsx
```

### Backend
```
sii-tecnm-celaya-backend/
├── server.js      # Express + rutas
├── supabase.js    # Cliente de Supabase
└── package.json
```

---

## Equipo

* RAMIREZ MIRELES GUSTAVO
* PARRA HERNÁNDEZ ESTEBAN DE JESUS
* MORALES RAMIREZ MARIANO

---

## API Reference

Base URL: `https://sii.celaya.tecnm.mx/api`

| Método | Endpoint | Descripción                       |
|--------|----------|-----------------------------------|
| POST | `/api/login` | Autenticación, devuelve Token JWT |
| GET | `/api/movil/estudiante` | Datos del estudiante              |
| GET | `/api/movil/estudiante/calificaciones` | Calificaciones del semestre       |
| GET | `/api/movil/estudiante/kardex` | Historial académico               |
| GET | `/api/movil/estudiante/horarios` | Horario del estudiante            |
