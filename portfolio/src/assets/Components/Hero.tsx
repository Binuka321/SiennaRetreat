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
          className="text-8xl font-Thin mb-6"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Enjoy A Luxury Experience And </h1>
        <h1 className="text-8xl font-Thin mb-6"
          style={{ fontFamily: 'Times New Roman, serif' }}>  The Best Moments
        </h1>

    
      </div>
    </div>
  );
};

export default Hero;
