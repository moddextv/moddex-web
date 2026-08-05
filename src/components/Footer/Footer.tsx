import { Container } from '@/components/UI/Container';
import { config } from '@/config';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-primary-700 py-5 text-sm text-primary-400">
      <Container className="flex flex-col sm:flex-row gap-x-6 gap-y-2 sm:items-center">
        <span>
          &copy; {year} {config.brand.name}
        </span>
        <span className="text-primary-500">not affiliated with twitch interactive</span>

        <nav className="flex gap-4 sm:ml-auto" aria-label="Footer">
          <a className="hover:text-primary-200 transition-colors duration-150" href="/tos">
            tos
          </a>
          <a className="hover:text-primary-200 transition-colors duration-150" href="/api/docs">
            api
          </a>
          <a
            className="hover:text-primary-200 transition-colors duration-150"
            href={config.brand.statusUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            status
          </a>
        </nav>
      </Container>
    </footer>
  );
};
