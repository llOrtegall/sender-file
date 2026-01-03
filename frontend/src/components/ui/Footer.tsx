import { SocialLink } from './SocialLink';

const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/winkermind/",
    ariaLabel: "Instagram",
    text: "IG",
  },
  {
    href: "https://www.facebook.com/winkermind",
    ariaLabel: "Facebook",
    text: "FB",
  }
];

export const Footer = () => {
  return (
    <footer className="w-full flex justify-between px-4 py-2">
      <div className="flex items-center font-imb-400 text-gray-1 text-[12px] xl:text-[14px] 2xl:text-[16px]">
        wShare
        <span className='px-1'>
          |
        </span>
        <a
          href='https://winkermind.com/'
          className="hover:text-green-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          Winkermind®
        </a>
        <span className='px-1'>
          2026
        </span>
      </div>
      <nav aria-label="Social media links" className="flex font-imb-400 text-gray-1">
        <ul className="flex gap-1 list-none p-0 m-0">
          {SOCIAL_LINKS.map((link) => (
            <SocialLink
              key={link.ariaLabel}
              href={link.href}
              ariaLabel={link.ariaLabel}
              text={link.text}
            />
          ))}
        </ul>
      </nav>
    </footer>
  )
}