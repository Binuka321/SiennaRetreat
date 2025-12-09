import React, { useContext } from 'react';
import Navbar from './assets/Components/Navbar';
import Hero from './assets/Components/Hero';
import Rooms from './assets/Components/Rooms';
import Facilities from './assets/Components/Facilities';
import Gallery from './assets/Components/Gallery';
import Footer from './assets/Components/Footer';
import WhatsappButton from './assets/Components/WhatsappButton';
import { AuthProvider, AuthContext } from './assets/Components/AuthContext';
import Admin from './assets/Components/Admin';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
};

export default App;

const InnerApp: React.FC = () => {
  const { user, isAdmin } = useContext(AuthContext) as any;

  return (
    <div className="font-sans scroll-smooth">
      <Navbar />
      <section id="hero"><Hero /></section>
      <section id="rooms"><Rooms /></section>
      <section id="facilities"><Facilities /></section>
      <section id="gallery"><Gallery /></section>
      {(isAdmin || (user && (user as any).isAdmin)) && (
        <section id="admin"><Admin /></section>
      )}
      <section id="contact"><Footer /></section>
      <WhatsappButton />
    </div>
  );
};
