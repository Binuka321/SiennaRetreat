import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import gallery1 from '../gallery1.jpg';
import gallery2 from '../gallery2.jpg';
import gallery3 from '../gallery3.jpg';
import gallery4 from '../gallery4.jpg';
import gallery5 from '../gallery5.jpg';
import gallery6 from '../gallery6.jpg';
import gallery7 from '../gallery7.jpg';
import gallery8 from '../gallery8.jpg';
import gallery9 from '../Room3.jpg';
import gallery10 from '../Washroom (2).jpg';
import gallery11 from '../gallery11.jpg';

const Gallery: React.FC = () => {
  const [showAll, setShowAll] = useState(false);

  const images: string[] = [
    gallery1, gallery2, gallery3, gallery4, gallery5, gallery6,
    gallery7, gallery8, gallery9, gallery10, gallery11,
  ];

  const visibleImages = showAll ? images : images.slice(0, 6);

  return (
    <section className="py-16 text-center">
      <h2 className="text-4xl font-bold mb-8">
        Enjoy An Unforgettable Stay With The Best Charm
      </h2>

      <div className="flex justify-center gap-6 flex-wrap">
        <AnimatePresence>
          {visibleImages.map((src, index) => (
            <motion.div
              key={src}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <img
                src={src}
                alt={`Gallery ${index + 1}`}
                className="w-80 h-52 object-cover rounded-lg shadow-lg"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={() => setShowAll(!showAll)}
        className="mt-8 px-6 py-2 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showAll ? 'See Less' : 'See More'}
      </motion.button>
    </section>
  );
};

export default Gallery;
