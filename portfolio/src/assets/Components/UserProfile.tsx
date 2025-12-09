import React, { useState, useEffect } from "react";

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
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user profile data from backend
    const fetchProfile = async () => {
      try {
        const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';
          const token = localStorage.getItem('token');
        
        if (email && token) {
          const res = await fetch(`${API_BASE}/api/users/profile/${email}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (res.ok) {
            const data = await res.json();
            setName(data.name || displayName || "");
            setPhone(data.phone || "");
            setAddress(data.address || "");
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [email, displayName]);

  const handleSave = async () => {
    try {
      setMessage(null);
      const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';
        const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('Not authenticated');
        return;
      }

      if (!email) {
        setMessage('Email not found');
        return;
      }

      const res = await fetch(`${API_BASE}/api/users/profile/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, address }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setEditing(false);
        setMessage('Profile saved successfully');
        setTimeout(() => setMessage(null), 2000);
        console.log("Profile saved:", data);
      } else {
        setMessage(data.message || 'Failed to save profile');
        console.error('Save failed:', data);
      }
    } catch (err) {
      setMessage('Error saving profile');
      console.error('Error saving profile:', err);
    }
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

            {message && (
              <div className={`text-sm p-2 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}

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
