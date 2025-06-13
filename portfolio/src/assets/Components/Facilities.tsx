const Facilities: React.FC = () => {
  const items: string[] = [
    'Free Wi-Fi',
    '24/7 Room Service',
    'Swimming Pool',
    'Parking',
    'Restaurant',
  ];

  return (
    <section className="py-16 bg-gray-100 text-center">
      <h2 className="text-3xl font-bold mb-8">Enjoy Complete And Best Quality Facilities</h2>
      <div className="flex justify-center gap-8 flex-wrap">
        {items.map((item, index) => (
          <div key={index} className="w-56 p-6 bg-white shadow rounded">
            <h3 className="text-xl font-semibold">{item}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Facilities;
