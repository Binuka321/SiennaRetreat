import Header from "./assets/Components/Header";
import About from "./assets/Components/About";
import Projects from "./assets/Components/Project";
import Contact from "./assets/Components/Contact";
import Footer from "./assets/Components/Footer";

function App() {
  return (
    <div className="font-sans bg-white text-gray-800 dark:bg-[#121212] dark:text-gray-100 transition-colors duration-300">
      <Header />
      <main className="max-w-5xl mx-auto px-4 space-y-16">
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
