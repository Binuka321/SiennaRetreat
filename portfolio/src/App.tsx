import Navbar from './assets/Components/Navbar';
import Hero from './assets/Components/Hero';
import Rooms from './assets/Components/Rooms';
import Facilities from './assets/Components/Facilities';
import Gallery from './assets/Components/Gallery';
import Footer from './assets/Components/Footer';
import WhatsappButton from './assets/Components/WhatsappButton';
import { AuthProvider } from './assets/Components/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="font-sans scroll-smooth">
        <Navbar />
      <section id="hero"><Hero /></section>
      <section id="rooms"><Rooms /></section>
      <section id="facilities"><Facilities /></section>
      <section id="gallery"><Gallery /></section>
      <section id="contact"><Footer /></section>
      <WhatsappButton />
      </div>
    </AuthProvider>
  );
};

export default App;
