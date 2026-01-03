type SocialLinkProps = {
  href: string;
  ariaLabel: string;
  text?: string;
};

export const SocialLink = ({ href, ariaLabel, text }: SocialLinkProps) => {
  return (
    <li className="flex items-center">
      <a
        className=""
        target="_blank"
        rel="noopener noreferrer"
        href={href}
        aria-label={ariaLabel}
      >
        <span className="text-gray-1 text-[10px] xl:text-[14px] 2xl:text-[18px] hover:text-green-800 px-1">{text}</span>
      </a>
    </li>
  );
};
