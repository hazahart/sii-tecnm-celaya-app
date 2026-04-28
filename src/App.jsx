function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600">
          Archivo .env funcionando
        </h1>
        <p className="text-slate-600 mt-2">
          API URL: {import.meta.env.VITE_API_BASE_URL}
        </p>
      </div>
    </div>
  )
}

export default App