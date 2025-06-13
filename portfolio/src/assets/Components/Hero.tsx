import React from 'react';
import heroImg from '../hero.jpg';

const Hero: React.FC = () => {
  return (
    <div className="relative h-screen w-full">
      <img
        src={heroImg}
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
        <h1
          className="text-7xl font-bold mb-6"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Enjoy A Luxury Experience And The Best Moments
        </h1>

        <button className="bg-yellow-500 text-black px-6 py-3 rounded-full text-lg font-semibold">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default Hero;
