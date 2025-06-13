import React from 'react';
import logo from '../logo.jpg';
const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-black bg-opacity-70 text-white">
       <div>
        <img src={logo} alt="Hotel Logo" className="h-20 w-auto" />
      </div>
      <ul className="hidden md:flex space-x-25 text-lg">
        <li><a href="#home" className="hover:text-yellow-400">Home</a></li>
        <li><a href="#rooms" className="hover:text-yellow-400">Rooms</a></li>
        <li><a href="#facilities" className="hover:text-yellow-400">Facilities</a></li>
        <li><a href="#gallery" className="hover:text-yellow-400">Gallery</a></li>
        <li><a href="#contact" className="hover:text-yellow-400">Contact</a></li>
      </ul>
     <button className="hidden md:block border-2 border-yellow-500 text-white px-5 py-2 rounded-[10px] font-medium hover:bg-yellow-400 hover:text-black">
         Book Now
    </button>

    </nav>
  );
};

export default Navbar;
