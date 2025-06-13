import Navbar from './assets/Components/Navbar';
import Hero from './assets/Components/Hero';
import Rooms from './assets/Components/Rooms';
import Facilities from './assets/Components/Facilities';
import Gallery from './assets/Components/Gallery';
import Footer from './assets/Components/Footer';

const App: React.FC = () => {
  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      <Rooms />
      <Facilities />
      <Gallery />
      <Footer />
    </div>
  );
};

export default App;
