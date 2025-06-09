import { useState, useEffect } from "react";

const Header = () => {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <header className="relative text-white text-center py-20 bg-gradient-to-r from-blue-900 via-cyan-500 to-pink-500 dark:from-gray-900 dark:via-gray-700 dark:to-gray-800">
      <div className="top-right-buttons absolute top-4 right-4 flex gap-2 z-10">
        <a
          href="/Binuka Somarathne.pdf"
          className="btn"
          download
        >
          Download CV
        </a>
        <a href="https://github.com/Binuka321" target="_blank" className="icon-btn" aria-label="GitHub">
          <i className="fab fa-github text-xl"></i>
        </a>
        <a href="https://linkedin.com/in/binuka-somarathne-9a163a31b/" target="_blank" className="icon-btn" aria-label="LinkedIn">
          <i className="fab fa-linkedin text-xl"></i>
        </a>
        <button onClick={() => setDarkMode(!darkMode)} className="icon-btn" aria-label="Toggle Theme">
          <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"} text-xl`}></i>
        </button>
      </div>

      <div className="relative z-10">
        <img src="/profile.jpg" alt="Profile" className="w-40 h-40 mx-auto rounded-full border-4 border-white shadow-md object-cover mb-4" />
        <h1 className="text-4xl font-bold">Binuka Somarathne</h1>
        <p className="text-lg">IT Undergraduate | Full Stack Developer</p>
        <nav className="mt-4 space-x-6">
          <a href="#about" className="hover:text-red-400">About</a>
          <a href="#projects" className="hover:text-red-400">Projects</a>
          <a href="#contact" className="hover:text-red-400">Contact</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
