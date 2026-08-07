import { auth } from '@/auth';
import { NavSearch } from '@/components/Header/NavSearch';
import { ProfileDropdown } from '@/components/Header/ProfileDropdown';
import { Container } from '@/components/UI/Container';
import { Mark } from '@/components/UI/Mark';
import { config } from '@/config';
import Link from 'next/link';

/**
 * 60px of chrome, and the search is the widest thing in it.
 *
 * there is no nav list any more. the four links that used to sit here (channel,
 * user, donate, api) were competing with the search for the same row; three of
 * them moved to the footer, where they are a directory rather than furniture,
 * and donate stays because it is the only one that asks for something.
 *
 * there is also no left rail. v2 had one and it was eating 240px of page width,
 * which was a real part of the "clamped" verdict.
 */
export const Header = async () => {
  const session = await auth();

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="nav">
        <Container className="nav-inner">
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 text-primary-100"
            aria-label={`${config.brand.name} home`}
          >
            {/* split rather than monochrome: at 24px in the nav the mark is
                doing real identity work now that purple is not, and the
                green/pink pair is the thing that replaced it. */}
            <Mark size={24} split />
            <span className="hidden sm:inline text-h3 font-extrabold tracking-tight">
              {config.brand.name}
            </span>
          </Link>

          <NavSearch />

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Link href="/donate" className="hidden md:inline-flex btn btn-ghost">
              Donate
            </Link>
            <ProfileDropdown session={session} />
          </div>
        </Container>
      </header>
    </>
  );
};
