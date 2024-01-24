import { redirect } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { getSession } from '@/lib/supabase-server';
import { MagicLinkForm } from './components/MagicLinkForm';

export default async function SignInPage() {
  const session = await getSession();

  if (session != null) {
    return redirect('/');
  }

  return (
    <div className="p-5 sm:p-10 sm:h-screen flex flex-col justify-center items-center">
      <div className="max-w-[375px]">
        <div className="mb-5 sm:mb-8 flex justify-center items-center">
          <Logo />
        </div>
        <MagicLinkForm />
      </div>
    </div>
  );
}
