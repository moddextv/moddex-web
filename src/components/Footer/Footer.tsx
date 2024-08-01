export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-800 py-4 text-center">
      <p>
        <span>&copy; {year}</span>
        <span> | </span>
        <span>not affiliated with twitch interactive</span>
        <span> | </span>
        <a className="underline" href={'/api/docs'}>api docs</a>
        <span> | </span>
        <a className="underline" href={'/tos'}>tos</a>
        <span> | </span>
        <a className="underline" href={'https://status.modchecker.com'} target="_blank">status</a>
      </p>
    </footer>
  );
};
