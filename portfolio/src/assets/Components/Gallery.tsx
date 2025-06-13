const Gallery: React.FC = () => {
  const images: string[] = ['/gallery1.jpg', '/gallery2.jpg', '/gallery3.jpg'];

  return (
    <section className="py-16 text-center">
      <h2 className="text-3xl font-bold mb-8">Enjoy An Unforgettable Stay With The Best Charm</h2>
      <div className="flex justify-center gap-6 flex-wrap">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Gallery ${index}`}
            className="w-80 h-52 object-cover rounded-lg shadow"
          />
        ))}
      </div>
    </section>
  );
};

export default Gallery;
