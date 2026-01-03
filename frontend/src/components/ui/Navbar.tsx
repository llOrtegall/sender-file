import { Link } from "react-router-dom"

export const NavBar = () => {
  return (
    <header className="w-full px-4 py-2">
      <nav className="flex justify-between">
        <Link to="/" className="flex items-center gap-2">
          <figure>
            <img src="/Logo.svg" alt="wShare Logo" className="size-6 2xl:size-8 " />
          </figure>
          <span className="font-imb-400 text-gray-300 ">wShare</span>
        </Link>
        <div className="flex gap-4 font-imb-400 text-gray-300 text-[12px] xl:text-[14px] 2xl:text-[16px]">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://whatsapp.com/channel/0029Va4on5GJJhzfsxIren2m"
            className="bg-green-1 px-2 py-0.5 rounded-md hover:bg-green-4 cursor-pointer">
            Join the Community
          </a>
        </div>
      </nav>
    </header>
  )
}