export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-800 py-4 text-center">
      <p>
        <span>&copy; {year}</span> -
        <span>not affiliated with twitch interactive</span> -
        <a className="underline" href={'/api/docs'}>api docs</a> -
        <a className="underline" href={'/tos'}>tos</a> -
        <a className="underline" href={'https://status.modchecker.com'} target="_blank">status</a></p>
    </footer>
  );
};
