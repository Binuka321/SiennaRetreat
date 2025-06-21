import React, { useState } from "react";

interface UserProfileProps {
  photoURL: string | null;
  email: string | null;
  displayName: string | null;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  photoURL,
  email,
  displayName,
  onClose,
}) => {
  const [name, setName] = useState(displayName || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [editing, setEditing] = useState(true); // true to allow editing by default

  const handleSave = () => {
    console.log("Saved:", { name, email, phone, address });
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-[400px] max-w-full">
        <div className="flex flex-col items-center">
          {photoURL ? (
            <img
              src={photoURL}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://via.placeholder.com/100";
              }}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400 mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-2xl border-4 border-yellow-400 mb-4">
              ?
            </div>
          )}

          <div className="w-full text-left space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 bg-gray-100"
                value={email || ""}
                disabled
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editing}
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Address</label>
              <textarea
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded"
              >
                Close
              </button>
              {editing ? (
                <button
                  onClick={handleSave}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
