import React, { useState, useEffect } from "react";
import logo from "../logo.jpg";
import { FaUserCircle } from "react-icons/fa";
import { auth, provider } from "../../config/firebase-config";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import UserProfile from "./UserProfile";

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken || "";
      const idToken = await user.getIdToken();

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("token", `Bearer ${idToken}`);
      localStorage.setItem("email", user.email || "");

      const googlePhoto = user.providerData[0]?.photoURL || user.photoURL || null;
      const name = user.displayName || "User";

      setIsLoggedIn(true);
      setUserPhoto(googlePhoto);
      setUserEmail(user.email || null);
      setDisplayName(name);
      setDropdownOpen(false);

      console.log("Logged in as:", name);
      console.log("Google photoURL:", googlePhoto);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setUserPhoto(null);
      setUserEmail(null);
      setDisplayName(null);
      setDropdownOpen(false);
      localStorage.clear();
      console.log("Logged out");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const googlePhoto = user.providerData[0]?.photoURL || user.photoURL || null;
        const name = user.displayName || "User";
        const email = user.email || null;

        setIsLoggedIn(true);
        setUserPhoto(googlePhoto);
        setDisplayName(name);
        setUserEmail(email);

        localStorage.setItem("email", email || "");

        console.log("Restored session for:", email);
        console.log("Google photoURL:", googlePhoto);
      } else {
        setIsLoggedIn(false);
        setUserPhoto(null);
        setUserEmail(null);
        setDisplayName(null);
        localStorage.removeItem("email");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-black bg-opacity-70 text-white">
        <div>
          <img src={logo} alt="Hotel Logo" className="h-20 w-auto" />
        </div>

        <ul className="hidden md:flex space-x-10 text-lg">
          {["Home", "Rooms", "Facilities", "Gallery", "Contact"].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className="hover:text-yellow-400 transition duration-300"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center space-x-4">
          <button className="hidden md:block border-2 border-yellow-500 text-white px-5 py-2 rounded-[10px] font-medium hover:bg-yellow-400 hover:text-black transition duration-300">
            Book Now
          </button>

          <div className="relative">
            <button onClick={toggleDropdown} className="focus:outline-none text-white">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).src =
                      "https://via.placeholder.com/40")
                  }
                  alt="User"
                  className="h-10 w-10 rounded-full border-2 object-cover"
                />
              ) : (
                <FaUserCircle size={36} />
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-white rounded-lg shadow-lg text-black py-2 z-50">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowProfile(true);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {showProfile && (
        <UserProfile
          photoURL={userPhoto}
          email={userEmail}
          displayName={displayName}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
};

export default Navbar;
