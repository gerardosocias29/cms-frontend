const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <p className="lg:ml-64 text-sm text-gray-500 dark:text-gray-400 flex gap-1 justify-center">
        &copy; {year} All Rights Reserved by
        <a
          href="https://cocotechsolutions.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-dark hover:underline"
        >
          Cocotech Solutions
        </a>.
      </p>
    </footer>
  );
};

export default Footer;