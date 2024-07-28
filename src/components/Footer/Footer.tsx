export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-800 py-4 text-center">
      <p>&copy; {year} - not affiliated with twitch interactive - <a className="underline" href={'/api/docs'}>api docs</a> - <a className="underline" href={'/tos'}>tos</a></p>
    </footer>
  );
};
