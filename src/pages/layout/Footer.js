const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-4">
      <p className="lg:ml-64 text-sm flex gap-2 justify-center">
        &copy; {year} All Rights Reserved by 
        <a
          href="https://cocotechsolutions.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Cocotech Solutions
        </a>
      </p>
    </footer>
  );
};

export default Footer;