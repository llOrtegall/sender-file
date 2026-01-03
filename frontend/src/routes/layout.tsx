import { Outlet } from "react-router-dom";
import { NavBar } from "../components/ui/Navbar";
import { Footer } from "../components/ui/Footer";

export default function Layout() {
  return (
    <>

      <NavBar />

      <main className="flex items-center justify-center relative">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}