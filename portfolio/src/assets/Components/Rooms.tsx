import { useState } from "react";
import room1Img from "../Room1.jpg";
import room2Img from "../Room2.jpg";
import room3Img from "../Room3.jpg";
import room from "../Room1.jpg"
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, provider } from "../../config/firebase-config";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const ROOM_TYPES = [
  { value: "double", label: "Double Room With Garden View" },
  { value: "shared", label: "Double Room With Shared Bathroom" },
  { value: "Twin", label: "Double/Twin Room With Shared Bathroom" },
];

const ROOM_CARDS = [
  {
    title: "Double Room with Garden View",
    img: room1Img,
    price: "$ 15/night",
    details: "12 m² | 1-3 guests | Free WIFI",
  },
  {
    title: "Family Room with Shared Bathroom",
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

interface Room {
  _id: string;
  type: string;
  title: string;
  price: string;
  details: string;
  img: string;
  isAvailable?: boolean;
}

interface BookingFormData {
  roomId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  numberOfGuests: number;
  specialRequests: string;
}

export default function RoomsHero() {
  const [roomTypes, setRoomTypes] = useState<string[]>([""]);
  const [checkIn, setCheckIn] = useState("2025-05-18");
  const [checkOut, setCheckOut] = useState("2025-05-19");
  const [rooms, setRooms] = useState("1");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [searchResults, setSearchResults] = useState<Room[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugRawResponse, setDebugRawResponse] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    roomId: "",
    userName: "",
    userEmail: "",
    userPhone: "",
    numberOfGuests: 1,
    specialRequests: "",
  });
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  const navigate = useNavigate();
  const adminEmail = "siennaretreat@gmail.com";
  const { user: authContextUser, token: authContextToken } = useContext(AuthContext);

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

  const handleSearch = async () => {
    const authInstance = getAuth();
    const user = authInstance.currentUser;
    const hasUsernameAuth = authContextUser && authContextToken;

    if (!user && !hasUsernameAuth) {
      setShowLoginPrompt(true);
      return;
    }

    // Perform search with API
    await performSearch();
  };

  const performSearch = async () => {
    try {
      setIsLoading(true);
      setBookingMessage("");
      setBookingError("");
      setDebugRawResponse(null);
      setDebugError(null);

      // Get the first selected room type (for now, search with first room type selected)
      const roomType = roomTypes[0] || "";
      const params = new URLSearchParams({
        checkInDate: checkIn,
        checkOutDate: checkOut,
        ...(roomType && { roomType }),
      });

      const url = `http://localhost:5000/api/rooms/search?${params}`;
      console.log('Fetching search URL:', url);

      const headers: any = { "Content-Type": "application/json" };
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = token;

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      console.log('Search response status:', response.status, response.statusText);

      if (!response.ok) {
        // try to read response body for a helpful error message
        let errBody = null;
        try {
          errBody = await response.json();
        } catch (e) {
          errBody = await response.text();
        }
        console.log('Error response body:', errBody);
        const msg = errBody && errBody.message ? errBody.message : (typeof errBody === 'string' ? errBody : 'Failed to search rooms');
        setDebugError(`${response.status} ${response.statusText}: ${msg}`);
        throw new Error(msg);
      }

      const data = await response.json();
      console.debug('Search response:', data);
      setDebugRawResponse(JSON.stringify(data, null, 2));
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      const msg = error instanceof Error ? error.message : String(error);
      setBookingError("Failed to search rooms. Please try again.");
      if (!debugError) setDebugError(msg);
    } finally {
      setIsLoading(false);
    }
  };  const handleBookNow = (room: Room) => {
    if (!room.isAvailable) {
      setBookingError("This room is not available for the selected dates.");
      return;
    }

    const authInstance = getAuth();
    const user = authInstance.currentUser;
    const hasUsernameAuth = authContextUser && authContextToken;

    if (!user && !hasUsernameAuth) {
      setShowLoginPrompt(true);
      return;
    }

    setSelectedRoom(room);
    // ensure single selection for legacy flow
    setSelectedRoomIds([room._id]);

    // Prefer username auth data if available, fall back to Google auth
    const displayName = authContextUser?.username || authContextUser?.email || user?.displayName || "";
    const email = authContextUser?.email || user?.email || "";

    setBookingData({
      roomId: room._id,
      userName: displayName,
      userEmail: email,
      userPhone: "",
      numberOfGuests: 1,
      specialRequests: "",
    });
    setShowBookingForm(true);
    setBookingError("");
    setBookingMessage("");
  };

  const toggleSelectRoom = (roomId: string) => {
    setSelectedRoomIds((prev) => {
      if (prev.includes(roomId)) return prev.filter((id) => id !== roomId);
      return [...prev, roomId];
    });
  };

  const handleBookingInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: name === "numberOfGuests" ? parseInt(value, 10) : value,
    }));
  };

  const submitBooking = async () => {
    try {
      setIsLoading(true);
      setBookingError("");
      setBookingMessage("");

      if (!bookingData.userName || !bookingData.userEmail || !bookingData.userPhone) {
        setBookingError("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }

      // If multiple rooms selected, call multi-book endpoint
      if (selectedRoomIds.length > 1) {
        const headers: any = { "Content-Type": "application/json" };
        const token = localStorage.getItem('token');
        if (token) headers['Authorization'] = token;

        const response = await fetch("http://localhost:5000/api/rooms/book-multiple", {
          method: "POST",
          headers,
          body: JSON.stringify({
            roomIds: selectedRoomIds,
            userName: bookingData.userName,
            userEmail: bookingData.userEmail,
            userPhone: bookingData.userPhone,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests: bookingData.numberOfGuests,
            specialRequests: bookingData.specialRequests,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Booking failed");
        }

        const data = await response.json();
        setBookingMessage(`✓ ${data.message} (${data.bookings.length} bookings created)`);
        setShowBookingForm(false);
        setSearchResults([]);
        setShowSearchResults(false);
        setSelectedRoomIds([]);
      } else {
        // Single room booking (legacy)
        const headersSingle: any = { "Content-Type": "application/json" };
        const tokenSingle = localStorage.getItem('token');
        if (tokenSingle) headersSingle['Authorization'] = tokenSingle;

        const response = await fetch("http://localhost:5000/api/rooms/book", {
          method: "POST",
          headers: headersSingle,
          body: JSON.stringify({
            roomId: bookingData.roomId || selectedRoomIds[0],
            userName: bookingData.userName,
            userEmail: bookingData.userEmail,
            userPhone: bookingData.userPhone,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests: bookingData.numberOfGuests,
            specialRequests: bookingData.specialRequests,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Booking failed");
        }

        const data = await response.json();
        setBookingMessage(`✓ ${data.message} Booking ID: ${data.booking._id}`);
        setShowBookingForm(false);
        setSearchResults([]);
        setShowSearchResults(false);
        setSelectedRoomIds([]);
      }
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError(
        error instanceof Error ? error.message : "Failed to complete booking"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken || "";
      const idToken = await user.getIdToken();

      localStorage.setItem("accessToken", `${accessToken}`);
      localStorage.setItem("token", `Bearer ${idToken}`);
      localStorage.setItem("email", user.email || "");

      setShowLoginPrompt(false);

      if (user.email === adminEmail) {
        navigate("/admin");
      } else {
        handleSearch();
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <section className="relative text-white">
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

          <button
            className="bg-[#b89b5e] text-white font-semibold text-lg px-6 py-2 rounded-md hover:bg-[#a6853e] disabled:opacity-50"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Messages */}
        {bookingMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {bookingMessage}
          </div>
        )}
        {bookingError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {bookingError}
          </div>
        )}

        {/* Search Results */}
        {showSearchResults && (
          <div className="mb-16">
            <h3 className="text-2xl text-white font-bold mb-8">Available Rooms</h3>
            {searchResults.length === 0 ? (
              <p className="text-white text-lg">No rooms available for the selected dates.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {searchResults.map((room) => (
                  <div
                    key={room._id}
                    className={`bg-white rounded-md overflow-hidden shadow-md ${
                      !room.isAvailable ? "opacity-60" : ""
                    }`}
                  >

                    <div className="p-6 text-center">
                      <h3 className="text-black text-lg font-light mb-3">
                        {room.title}
                      </h3>
                      <p className="text-gray-500 font-light text-sm mb-3">
                        From :{" "}
                        <span className="text-[#b89b5e] font-semibold text-lg italic">
                          {room.price}
                        </span>
                      </p>
                      <p className="text-gray-600 text-sm mb-4">{room.details}</p>

                      {/* Availability Status */}
                      <div className="mb-4">
                        {room.isAvailable ? (
                          <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            ✓ Available
                          </span>
                        ) : (
                          <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                            ✗ Not Available
                          </span>
                        )}
                      </div>

                      {/* Selection Checkbox for multi-booking */}
                      <div className="mb-3">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedRoomIds.includes(room._id)}
                            onChange={() => toggleSelectRoom(room._id)}
                            disabled={!room.isAvailable}
                            className="form-checkbox h-4 w-4 text-[#b89b5e]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {room.isAvailable ? 'Select to book' : 'Unavailable'}
                          </span>
                        </label>
                      </div>

                      {/* Single-room Book Button (legacy) */}
                      <button
                        onClick={() => handleBookNow(room)}
                        disabled={!room.isAvailable}
                        className={`w-full px-4 py-2 rounded font-semibold ${
                          room.isAvailable
                            ? "bg-[#b89b5e] text-white hover:bg-[#a6853e]"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {room.isAvailable ? "Book Now" : "Not Available"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {/* Multi-book action bar */}
        {showSearchResults && selectedRoomIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded shadow-lg z-40">
            <div className="flex items-center gap-4">
              <span className="text-black font-semibold">{selectedRoomIds.length} room(s) selected</span>
              <button
                onClick={async () => {
                  // open booking modal for multi-book; prefill using first selected room title
                  const authInstance = getAuth();
                  const user = authInstance.currentUser;
                  const hasUsernameAuth = authContextUser && authContextToken;

                  if (!user && !hasUsernameAuth) {
                    setShowLoginPrompt(true);
                    return;
                  }

                  const displayName = authContextUser?.username || authContextUser?.email || user?.displayName || '';
                  const email = authContextUser?.email || user?.email || '';

                  setBookingData((prev) => ({
                    ...prev,
                    userName: displayName,
                    userEmail: email,
                    userPhone: prev.userPhone || '',
                  }));

                  // set selectedRoom to first selected for title display in modal
                  const first = searchResults.find((r) => r._id === selectedRoomIds[0]) || null;
                  setSelectedRoom(first);
                  setShowBookingForm(true);
                }}
                className="bg-[#b89b5e] text-white px-4 py-2 rounded font-semibold"
              >
                Book Selected
              </button>
              <button
                onClick={() => setSelectedRoomIds([])}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        {!showSearchResults && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#f8f2e9] px-6 md:px-20 py-20 rounded-md mb-16">
              <h2 className="text-5xl md:text-5xl text-black font-serif font-bold leading-tight">
                Comfortable Rooms <br /> Just For You
              </h2>
              <p className="text-lg md:text-2xl text-gray-500 font-serif leading-relaxed">
                Discover a perfect blend of style and comfort, where every detail is
                crafted to make your stay truly unforgettable.
              </p>
            </div>

            {/* Room Cards */}
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
                    <h3 className="text-black text-lg font-light mb-3">
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
          </>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-xl max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Book {selectedRoom.title}
            </h2>
            <p className="text-gray-600 mb-6">
              Check-in: {checkIn} | Check-out: {checkOut}
            </p>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={bookingData.userName}
                    onChange={handleBookingInputChange}
                    className="w-full px-3 py-2 border text-black border-black rounded focus:outline-none focus:border-[#b89b5e]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="userEmail"
                    value={bookingData.userEmail}
                    onChange={handleBookingInputChange}
                    className="w-full px-3 py-2 border text-black border-black rounded focus:outline-none focus:border-[#b89b5e]"
                    required
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="userPhone"
                    value={bookingData.userPhone}
                    onChange={handleBookingInputChange}
                    className="w-full px-3 py-2 border text-black border-black rounded focus:outline-none focus:border-[#b89b5e]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Number of Guests
                  </label>
                  <select
                    name="numberOfGuests"
                    value={bookingData.numberOfGuests}
                    onChange={handleBookingInputChange}
                    className="w-full px-3 py-2 border text-black border-black rounded focus:outline-none focus:border-[#b89b5e]"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} Guest{num > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Special Requests (Optional)
                </label>
                <textarea
                  name="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={handleBookingInputChange}
                  className="w-full px-3 py-2 border text-black border-black rounded focus:outline-none focus:border-[#b89b5e]"
                  rows={3}
                  placeholder="Any special requests or preferences..."
                />
              </div>
            </form>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowBookingForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitBooking}
                disabled={isLoading}
                className="bg-[#b89b5e] text-white px-6 py-2 rounded hover:bg-[#a6853e] font-semibold disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              You must be logged in to search and book
            </h2>
            <p className="text-gray-600 mb-6">Would you like to log in now?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogin}
                className="bg-[#b89b5e] text-white px-4 py-2 rounded hover:bg-[#a6853e]"
              >
                Log In with Google
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
