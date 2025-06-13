type Room = {
  title: string;
  img: string;
};

const Rooms: React.FC = () => {
  const rooms: Room[] = [
    { title: 'Double Bed Room', img: '/room1.jpg' },
    { title: 'Deluxe Room', img: '/room2.jpg' },
    { title: 'Superior Room', img: '/room3.jpg' },
  ];

  return (
    <section className="py-16 text-center">
      <h2 className="text-3xl font-bold mb-8">Comfortable Rooms Just For You</h2>
      <div className="flex justify-center gap-6 flex-wrap">
        {rooms.map((room, index) => (
          <div key={index} className="w-80 shadow-lg rounded-lg overflow-hidden">
            <img src={room.img} alt={room.title} className="h-48 w-full object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{room.title}</h3>
              <p className="text-gray-600">Starting from $50/night</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Rooms;
