export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="wrapper">
        <p className="smol">© {currentYear} - Not affiliated with Twitch Interactive</p>
      </div>
    </footer>
  );
};