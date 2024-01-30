import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

export function Footer() {
  return (
    <footer className="sticky top-[100vh] pt-6 md:pt-10 flex items-center md:justify-center space-x-8 text-xs">
      <Image
        src="/logo.svg"
        alt="punchlines.ai logo"
        width={24}
        height={22}
        priority={true}
      />
      <Dialog>
        <DialogTrigger className="hover:underline">Learn more</DialogTrigger>
        <DialogContent className="max-w-[85%] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>About</DialogTitle>
          </DialogHeader>
          <div>
            <p className="mb-4">
              <strong>punchlines.ai</strong> is an AI joke generation tool built
              on top of a large language model (LLM). It was fine-tuned on
              thousands of late night comedy monologue jokes. And boy are its
              arms tired!
            </p>
            <p className="mb-4">
              You can generate a limited number of jokes every day for free or
              upgrade for unlimited knee-slappers (and to save and sync your
              favorites across devices).
            </p>
            <div className="mt-6 flex items-center space-x-4 sm:space-x-6">
              <a
                href="https://twitter.com/brensudol"
                className="text-xs sm:text-sm underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Made by @brensudol
              </a>
              <a
                href="https://github.com/brendansudol/punchlines-ai"
                className="text-xs sm:text-sm underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Code on GitHub
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <a
        href="mailto:brendansudol@gmail.com?Subject=punchlines.ai"
        className="hover:underline"
      >
        Contact us
      </a>
    </footer>
  );
}
