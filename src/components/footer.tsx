import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 flex h-[50px] w-full items-center i justify-between bg-gray-100 border-t border-gray-200 px-6">
      <div>© TFT Labs</div>
      <nav className="text-sm sm:text-base">
        <a href="https://github.com" target="_blank">
          About
        </a>
        <span className="mx-2 text-gray-400">·</span>
        <a href="https://github.com" target="_blank">
          Terms
        </a>
        <span className="mx-2 text-gray-400">·</span>
        <a href="https://github.com" target="_blank">
          Privacy
        </a>
        <span className="mx-2 text-gray-400">·</span>
        <a href="https://github.com" target="_blank">
          Contact
        </a>
      </nav>
    </footer>
  );
};

export default Footer;
