const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-gray-600 text-left">
        {/* Column 1 - Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-2">Sienna Retreat</h3>
          <p className="text-gray-400">274/1b Ampitiya Road,<br />20160 Kandy,<br />Sri Lanka</p>
          <p className="text-gray-400 mt-2">+94752451510</p>
          <p className="text-gray-400 mt-1">siennaRetkandy@gmail.com</p>
        </div>

        {/* Column 2 - Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-2">Quick links</h3>
          <ul className="space-y-1">
            <li><a href="#" className="text-gray-400 hover:text-black">Home</a></li>
            <li><a href="#" className="text-gray-400 hover:text-black">Rooms</a></li>
            <li><a href="#" className="text-gray-400 hover:text-black">Facilities</a></li>
            <li><a href="#" className="text-gray-400 hover:text-black">Gallery</a></li>
          </ul>
        </div>

        {/* Column 3 - Social */}
        <div>
          <h3 className="text-lg font-semibold text- mb-2">Social</h3>
          <ul className="space-y-1">
            <li><a href="#" className="text-gray-400 hover:text-black">Facebook</a></li>
            <li><a href="#" className="text-gray-400 hover:text-black">Instagram</a></li>
          </ul>
        </div>

        {/* Column 4 - Legal */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-2">Legal</h3>
          <ul className="space-y-1">
            <li><a href="#" className="text-gray-400 hover:text-black">Terms of service</a></li>
            <li><a href="#" className="text-gray-400 hover:text-black">Privacy policy</a></li>
            <li><a href="#" className="text-gray-400 hover:text-black">Cookie policy</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#fdf9f3] text-center py-4 text-sm text-black border-t border-gray-200">
        <p>&copy; 2025 Sienna Retreat. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
