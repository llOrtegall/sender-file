import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="h-screen w-full bg-linear-to-t from-green-1 to-green-2 flex flex-col justify-between">
      <header className="p-4">
        <h1 className="text-2xl font-bold text-white">SenderFile</h1>
      </header> 
      <main className="flex flex-col justify-center items-center px-4">
        <h2 className="text-4xl font-bold text-white mb-4">404 - Página no encontrada</h2>
        <p className="text-white mb-8">Lo sentimos, la página que buscas no existe.</p>
        <Link to="/" className="bg-white text-green-1 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-green-50 transition">Volver al inicio</Link>
      </main>
      <footer className="p-4 text-center text-white">
        &copy; {new Date().getFullYear()} SenderFile. Todos los derechos reservados.
      </footer>
    </div>
  )
}