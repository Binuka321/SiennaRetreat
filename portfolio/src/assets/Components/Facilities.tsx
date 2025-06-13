import { FaCheck } from 'react-icons/fa';
import { PiDoorLight, PiBathtub, PiBed, PiMountains, PiFlowerLotus } from 'react-icons/pi';

const Facilities: React.FC = () => {
  const facilityGroups = [
    {
      icon: <PiDoorLight className="text-xl" />,
      title: 'Popular Facilities',
      items: [
        'Free parking',
        'Free WiFi',
        'Non-smoking rooms',
        '24-hour front desk',
        'Room service',
        'Facilities for disabled guests',
        'Airport shuttle',
      ],
    },
    {
      icon: <PiBathtub className="text-xl" />,
      title: 'Bathroom Amenities',
      items: [
        'Towels',
        'Toilet paper',
        'Toilet',
        'Free toiletries',
        'Hairdryer',
        'Shower',
        'Private bathroom',
      ],
    },
    {
      icon: <PiBed className="text-xl" />,
      title: 'Bedroom Comforts',
      items: ['Wardrobe or closet'],
    },
    {
      icon: <PiMountains className="text-xl" />,
      title: 'Scenic Views',
      items: ['Mountain view', 'Garden view'],
    },
    {
      icon: <PiFlowerLotus className="text-xl" />,
      title: 'Outdoor Spaces',
      items: ['Terrace', 'Garden'],
    },
  ];

  return (
    <section className=" bg-white text-gray-900">
      <section className="py-20 bg-white text-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto px-6 md:px-20">
          <h2 className="text-5xl md:text-5xl font-serif font-bold leading-tight">
            Enjoy Complete And <br /> Best Quality Facilities
          </h2>
         <p className="text-gray-500 text-lg md:text-2xl font-serif leading-relaxed">
            Providing an exceptional experience with all the top amenities and comforts you expect during your stay.
         </p>
         </div>
    </section>

      <div className="flex flex-wrap justify-center gap-8">
        {/* Group 1: Popular Facilities */}
        <div className="bg-[#fdf9f3] w-72 p-6 rounded-md">
          <div className="flex items-center mb-4 text-lg font-semibold">
            <PiDoorLight className="mr-2 text-2xl" />
            Popular Facilities
          </div>
          <ul className="space-y-2 text-gray-700">
            {facilityGroups[0].items.map((item, idx) => (
              <li key={idx} className="flex items-center">
                <FaCheck className="mr-2 text-black" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Group 2: Bathroom Amenities */}
        <div className="bg-[#fdf9f3] w-72 p-6 rounded-md">
          <div className="flex items-center mb-4 text-lg font-semibold">
            <PiBathtub className="mr-2 text-2xl" />
            Bathroom Amenities
          </div>
          <ul className="space-y-2 text-gray-700">
            {facilityGroups[1].items.map((item, idx) => (
              <li key={idx} className="flex items-center">
                <FaCheck className="mr-2 text-black" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Group 3: Bedroom + Views + Outdoor */}
        <div className="bg-[#fdf9f3] w-72 p-6 rounded-md space-y-6">
          {/* Bedroom Comforts */}
          <div>
            <div className="flex items-center mb-2 text-lg font-semibold">
              <PiBed className="mr-2 text-2xl" />
              Bedroom Comforts
            </div>
            <ul className="space-y-2 text-gray-700">
              {facilityGroups[2].items.map((item, idx) => (
                <li key={idx} className="flex items-center">
                  <FaCheck className="mr-2 text-black" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Scenic Views */}
          <div>
            <div className="flex items-center mb-2 text-lg font-semibold">
              <PiMountains className="mr-2 text-2xl" />
              Scenic Views
            </div>
            <ul className="space-y-2 text-gray-700">
              {facilityGroups[3].items.map((item, idx) => (
                <li key={idx} className="flex items-center">
                  <FaCheck className="mr-2 text-black" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Outdoor Spaces */}
          <div>
            <div className="flex items-center mb-2 text-lg font-semibold">
              <PiFlowerLotus className="mr-2 text-2xl" />
              Outdoor Spaces
            </div>
            <ul className="space-y-2 text-gray-700">
              {facilityGroups[4].items.map((item, idx) => (
                <li key={idx} className="flex items-center">
                  <FaCheck className="mr-2 text-black" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Facilities;
