import { AuthNav } from './AuthNav';
import { Logo } from './Logo';

export function Header() {
  return (
    <div className="mb-8">
      <div className="mb-1.5 flex items-center justify-between space-x-2">
        <Logo />
        <AuthNav />
      </div>
      <p>
        Meet your new AI comedy writing partner. You provide a joke set-up, and
        it generates the zingers.
      </p>
    </div>
  );
}
