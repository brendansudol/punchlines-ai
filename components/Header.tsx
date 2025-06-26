import { AuthNav } from './AuthNav';
import { Logo } from './Logo';

type HeaderProps = {
  showDescription?: boolean;
};

export function Header({ showDescription = false }: HeaderProps) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between space-x-2">
        <Logo />
        {/* @ts-expect-error */}
        <AuthNav />
      </div>
      {showDescription && (
        <p>
          Meet your new AI comedy writing partner. You provide a joke set-up,
          and it generates the zingers.
        </p>
      )}
    </div>
  );
}
