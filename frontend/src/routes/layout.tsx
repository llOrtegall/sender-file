import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <section className="h-screen w-full bg-linear-to-t from-green-1 to-green-2 flex flex-col justify-between">

      <nav className="w-full flex justify-between px-12 py-2">
        <div className="flex items-center gap-2">
          <figure className="p-2 size-6 rounded-md bg-gray-200"></figure>
          <span className="font-imb-400 text-gray-300 ">wSend</span>
        </div>
        <div className="flex gap-4 font-imb-400 text-gray-300">
          <button disabled>Login</button>
          <button disabled className="bg-green-1 px-2 py-0.5 rounded-md">Register</button>
        </div>
      </nav>

      <main className="flex items-center justify-center">
        <Outlet />
      </main>

      <footer className="w-full flex justify-between px-12 py-2">
        <div className="font-imb-400 text-gray-1">
          wSender | winkermind © 2025
        </div>
        <div className="flex gap-4 font-imb-400 text-gray-1">
          <span>FB</span>
          <span>TW</span>
          <span>IG</span>
          <span>IN</span>
        </div>
      </footer>
    </section>
  )
}