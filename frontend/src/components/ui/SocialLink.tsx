type SocialLinkProps = {
  href: string;
  ariaLabel: string;
  image?: {
    src: string;
    alt: string;
  };
  text?: string;
};

export const SocialLink = ({ href, ariaLabel, image, text }: SocialLinkProps) => {
  return (
    <li className="flex items-center">
      <a
        className="rounded-full bg-green-4 size-6 xl:size-8 2xl:size-10 flex items-center justify-center cursor-pointer hover:bg-green-500"
        target="_blank"
        rel="noopener noreferrer"
        href={href}
        aria-label={ariaLabel}
      >
        {image ? (
          <img src={image.src} alt={image.alt} className="size-3.5 xl:size-5 2xl:size-6" />
        ) : (
          <span className="text-black text-[10px] xl:text-[14px] 2xl:text-[18px]">{text}</span>
        )}
      </a>
    </li>
  );
};
