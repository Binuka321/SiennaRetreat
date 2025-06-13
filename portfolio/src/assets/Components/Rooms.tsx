import { useState } from "react";
import room1Img from "../Room1.jpg";
import room2Img from "../Room1.jpg";
import room3Img from "../Room3.jpg";

const ROOM_TYPES = [
  { value: "double", label: "Double Room With Garden View" },
  { value: "shared", label: "Double Room With Shared Bathroom" },
  { value: "Twin", label: "Double/Twin Room With Shared Bathroom" },
];

const ROOM_CARDS = [
  {
    title: "Double Room with Shared Bathroom",
    img: room1Img,
    price: "$ 15/night",
    details: "12 m² | 1-3 guests | Free WIFI",
  },
  {
    title: "Double Room with Private Bathroom",
    img: room2Img,
    price: "$ 15/night",
    details: "12 m² | 1-3 guests | Free WIFI",
  },
  {
    title: "Double or Twin Room with Shared Bathroom",
    img: room3Img,
    price: "$ 15/night",
    details: "12 m² | 1-3 guests | Free WIFI",
  },
];

export default function RoomsHero() {
  const [roomTypes, setRoomTypes] = useState<string[]>([""]);
  const [checkIn, setCheckIn] = useState("2025-05-18");
  const [checkOut, setCheckOut] = useState("2025-05-19");
  const [rooms, setRooms] = useState("1");

  const handleRoomsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setRooms(value);
    const num = parseInt(value, 10);
    setRoomTypes((prev) => {
      const newArr = prev.slice(0, num);
      while (newArr.length < num) {
        newArr.push("");
      }
      return newArr;
    });
  };

  const handleRoomTypeChange = (index: number, value: string) => {
    setRoomTypes((prev) => {
      const newArr = [...prev];
      newArr[index] = value;
      return newArr;
    });
  };

  return (
    <section className="relative text-white">
      {/* Search bar */}
      <div className="relative z-10 px-4 md:px-20 py-12">
        <div className="bg-[#f8f2e9] text-black rounded-md shadow-lg flex flex-wrap justify-between items-center px-6 py-4 mb-16">
          <div className="flex flex-col items-start mb-4 md:mb-0 md:mr-4">
            <span className="text-sm text-gray-500">Rooms</span>
            <select
              value={rooms}
              onChange={handleRoomsChange}
              className="font-semibold text-lg bg-transparent focus:outline-none appearance-none px-3 py-2"
            >
              <option value="1">1 Room</option>
              <option value="2">2 Rooms</option>
              <option value="3">3 Rooms</option>
            </select>
          </div>

          {Array.from({ length: parseInt(rooms) }, (_, i) => {
            const selectedOthers = roomTypes.filter((rt, idx) => rt && idx !== i);
            const optionsForSelect = ROOM_TYPES.filter(
              (rt) => !selectedOthers.includes(rt.value)
            );

            return (
              <div key={i} className="flex flex-col items-start mb-4 md:mb-0 md:mr-4">
                <span className="text-sm text-gray-500">Room Type {i + 1}</span>
                <select
                  value={roomTypes[i]}
                  onChange={(e) => handleRoomTypeChange(i, e.target.value)}
                  className="font-semibold text-lg text-black bg-transparent focus:outline-none appearance-none px-3 py-2"
                >
                  <option value="">Select Type</option>
                  {optionsForSelect.map((rt) => (
                    <option key={rt.value} value={rt.value}>
                      {rt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}

          <div className="flex flex-col items-start mb-4 md:mb-0 md:mr-4">
            <span className="text-sm text-gray-500">Checkin</span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="font-semibold text-lg bg-transparent focus:outline-none px-3 py-2"
            />
          </div>

          <div className="flex flex-col items-start mb-4 md:mb-0 md:mr-4">
            <span className="text-sm text-gray-500">Checkout</span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="font-semibold text-lg bg-transparent focus:outline-none px-3 py-2"
            />
          </div>

          <button className="bg-[#b89b5e] text-white font-semibold text-lg px-6 py-2 rounded-md hover:bg-[#a6853e]">
            Search
          </button>
        </div>

        {/* Hero text section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#f8f2e9] px-6 md:px-20 py-20 rounded-md mb-16">
          <h2 className="text-5xl md:text-5xl text-black font-serif font-bold leading-tight">
            Comfortable Rooms <br /> Just For You
          </h2>
          <p className="text-lg md:text-2xl text-gray-500 font-serif leading-relaxed">
            Discover a perfect blend of style and comfort, where every detail is
            crafted to make your stay truly unforgettable.
          </p>
        </div>

        {/* Room cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ROOM_CARDS.map((room, idx) => (
            <div
              key={idx}
              className="bg-white rounded-md overflow-hidden shadow-md"
            >
             <div className="w-full aspect-square max-w-[300px] mx-auto overflow-hidden">
                <img
                   src={room.img}
                   alt={room.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="p-6 text-center">
                <h3 className="text-black text-lg font-light  mb-3">
                  {room.title}
                </h3>
                <p className="text-gray-500 font-light text-sm mb-3">
                  From :{" "}
                  <span className="text-[#b89b5e] font-semibold text-lg italic">
                    {room.price}
                  </span>
                </p>
                <p className="text-gray-600 text-sm">{room.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
