export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-800 py-4 text-center">
      <p>&copy; {year} - Not affiliated with Twitch Interactive</p>
    </footer>
  );
};
