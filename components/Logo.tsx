import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <Image
        src="/logo.svg"
        alt="punchlines.ai logo"
        width={36}
        height={33}
        priority={true}
      />
      <Link
        href="/"
        className="flex items-baseline text-base sm:text-xl uppercase font-bold tracking-wider hover:underline underline-offset-2"
      >
        punchlines
        <span className="font-serif text-lg text-2xl leading-none text-cyan-500">
          .
        </span>
        ai
      </Link>
    </div>
  );
}
