import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

interface User {
  _id?: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
}

interface Booking {
  _id?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  checkInDate: string;
  checkOutDate: string;
  roomTitle: string;
  roomPrice: string;
  numberOfGuests: number;
  specialRequests?: string;
  status?: string;
}

const Admin: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'rooms'>('users');
  // Rooms management
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  // Users tab
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Bookings & calendar tab
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateBookings, setSelectedDateBookings] = useState<Booking[]>([]);
  
  // Database status
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const { setIsAdmin: setGlobalIsAdmin } = useContext(AuthContext) as any;

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdmin(true);
      fetchDBStatus();
      fetchUsers();
      fetchBookings();
      fetchRooms();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { message: text };
      }

      if (!res.ok) throw new Error(data.message || `Login failed (status ${res.status})`);
      if (!data.token) throw new Error('No token returned from server');

      localStorage.setItem('adminToken', data.token);
      try { setGlobalIsAdmin(true); } catch (e) {}
      setIsAdmin(true);
      setMessage('Logged in as admin');
      setEmail('');
      setPassword('');
      fetchUsers();
      fetchBookings();
    } catch (err: any) {
      console.error('Admin login error', err);
      setMessage(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: token },
      });

      const text = await res.text();
      let data: any = [];
      try {
        data = text ? JSON.parse(text) : [];
      } catch (e) {
        console.error('Parse error', e);
        data = [];
      }

      if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setMessage(err.message || 'Error fetching users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchDBStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch('/api/admin/status', {
        headers: { Authorization: token },
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Parse error', e);
      }

      setDbStatus(data.mongoDBStatus || 'unknown');
    } catch (err: any) {
      console.error('Error fetching DB status', err);
      setDbStatus('error');
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch('/api/admin/bookings', {
        headers: { Authorization: token },
      });

      const text = await res.text();
      let data: any = [];
      try {
        data = text ? JSON.parse(text) : [];
      } catch (e) {
        console.error('Parse error', e);
        data = [];
      }

      if (!res.ok) throw new Error(data.message || 'Failed to fetch bookings');
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setMessage(err.message || 'Error fetching bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchRooms = async () => {
    setRoomsLoading(true);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching rooms', err);
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  const handleSaveRoom = async (roomId: string, update: any) => {
    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify(update)
      });
      if (!res.ok) throw new Error('Failed to save room');
      const updated = await res.json();
      setRooms(prev => prev.map(r => r._id === updated._id ? updated : r));
      setMessage('Room saved');
      setTimeout(() => setMessage(null), 2000);
    } catch (err: any) {
      setMessage(err.message || 'Error saving room');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: token }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel booking');
      setMessage('Booking cancelled');
      fetchBookings();
      setTimeout(() => setMessage(null), 2000);
    } catch (err: any) {
      setMessage(err.message || 'Error cancelling booking');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setMessage('Logged out');
    setUsers([]);
    setBookings([]);
  };

  const handleCreateTestData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/seed-test-data', {
        method: 'POST',
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { message: text };
      }

      if (!res.ok) throw new Error(data.error || 'Failed to create test data');

      setMessage(data.message || 'Test data created! Refreshing...');
      setTimeout(() => {
        fetchUsers();
        fetchBookings();
      }, 500);
    } catch (err: any) {
      setMessage(err.message || 'Error creating test data');
    } finally {
      setLoading(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getBookingsForDate = (date: Date): Booking[] => {
    return bookings.filter((booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return date >= checkIn && date < checkOut;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const bookingsOnDate = getBookingsForDate(clickedDate);
    setSelectedDateBookings(bookingsOnDate);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays = Array.from({ length: firstDay }, () => 0).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  if (!isAdmin) {
    return (
      <div id="admin" className="min-h-screen py-24 px-6 md:px-20 bg-[#f4f6f8]">
        <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Admin Login</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border px-3 py-2 rounded"
                required
                type="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border px-3 py-2 rounded"
                required
                type="password"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#b89b5e] text-white px-4 py-2 rounded hover:bg-[#a6853e] disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={() => { setEmail('siennaretreat@gmail.com'); setPassword('Sienna1234'); }}
                className="bg-gray-100 px-3 py-2 rounded text-sm"
              >
                Fill demo creds
              </button>
            </div>
          </form>

          {message && <div className="mt-4 text-sm text-gray-700">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div id="admin" className="min-h-screen py-16 px-6 md:px-20 bg-[#f4f6f8]">
      <div className="max-w-6xl mx-auto bg-white rounded shadow">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-6">
          <div>
            <h2 className="text-3xl font-semibold">Admin Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">
              MongoDB: <span className={dbStatus === 'connected' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{dbStatus || 'checking...'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {users.length === 0 && (
              <button
                onClick={handleCreateTestData}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
              >
                {loading ? 'Creating...' : 'Create Test Data'}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Log out
            </button>
          </div>
        </div>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded m-6">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 font-semibold text-lg border-b-4 transition ${
              activeTab === 'users'
                ? 'border-[#b89b5e] text-[#b89b5e]'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-4 font-semibold text-lg border-b-4 transition ${
              activeTab === 'bookings'
                ? 'border-[#b89b5e] text-[#b89b5e]'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-6 py-4 font-semibold text-lg border-b-4 transition ${
              activeTab === 'rooms'
                ? 'border-[#b89b5e] text-[#b89b5e]'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Rooms ({rooms.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              {usersLoading ? (
                <p className="text-gray-600">Loading users...</p>
              ) : users.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded p-4 text-blue-800">
                  <p className="font-semibold mb-2">No users found</p>
                  <p className="text-sm mb-3">Users are created when they register for an account. No registrations have been made yet.</p>
                  <button
                    onClick={() => { fetchUsers(); fetchDBStatus(); }}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Phone</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">{user.name || '—'}</td>
                          <td className="px-4 py-3">{user.phone || '—'}</td>
                          <td className="px-4 py-3">{user.address || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab with Calendar */}
          {activeTab === 'bookings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
                      ← Prev
                    </button>
                    <h3 className="text-xl font-semibold">{monthName}</h3>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
                      Next →
                    </button>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                      const bookingsOnDay =
                        day > 0 ? getBookingsForDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)) : [];
                      const hasBookings = bookingsOnDay.length > 0;

                      return (
                        <div
                          key={idx}
                          onClick={() => day > 0 && handleDateClick(day)}
                          className={`aspect-square flex items-center justify-center rounded text-sm font-medium cursor-pointer transition ${
                            day === 0
                              ? 'bg-gray-50'
                              : hasBookings
                              ? 'bg-[#b89b5e] text-white font-bold hover:bg-[#a6853e]'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          {day > 0 && (
                            <div className="text-center">
                              <div>{day}</div>
                              {hasBookings && <div className="text-xs">({bookingsOnDay.length})</div>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bookings List / Selected Date Details */}
              <div>
                {bookingsLoading ? (
                  <p className="text-gray-600">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <div className="bg-white border rounded-lg p-6">
                    <div className="bg-blue-50 border border-blue-200 rounded p-4 text-blue-800">
                      <p className="font-semibold mb-2">No bookings found</p>
                      <p className="text-sm mb-3">Bookings appear here when users make room reservations.</p>
                      <button
                        onClick={() => { fetchBookings(); fetchDBStatus(); }}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                ) : selectedDateBookings.length > 0 ? (
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Bookings</h3>
                    <div className="space-y-4">
                      {selectedDateBookings.map((booking) => (
                        <div key={booking._id} className="border rounded p-3 bg-gray-50">
                          <p className="font-semibold text-sm">{booking.roomTitle}</p>
                          <p className="text-xs text-gray-600">Guest: {booking.userName}</p>
                          <p className="text-xs text-gray-600">Email: {booking.userEmail}</p>
                          <p className="text-xs text-gray-600">Phone: {booking.userPhone}</p>
                          <p className="text-xs text-gray-600">Guests: {booking.numberOfGuests}</p>
                          <p className="text-xs text-[#b89b5e] font-semibold mt-1">
                            {new Date(booking.checkInDate).toLocaleDateString()} →{' '}
                            {new Date(booking.checkOutDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border rounded-lg p-6">
                    <p className="text-gray-600 text-sm">Click a date with bookings to see details</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div>
              {roomsLoading ? (
                <p className="text-gray-600">Loading rooms...</p>
              ) : rooms.length === 0 ? (
                <div className="bg-white border rounded-lg p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 text-blue-800">
                    <p className="font-semibold mb-2">No rooms found</p>
                    <p className="text-sm mb-3">Rooms are created in the database and appear here for editing.</p>
                    <button
                      onClick={() => fetchRooms()}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div key={room._id} className="bg-white border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          className="mt-1 block w-full border px-3 py-2 rounded"
                          value={room.title || ''}
                          onChange={(e) => setRooms(prev => prev.map(r => r._id === room._id ? { ...r, title: e.target.value } : r))}
                        />

                        <label className="block text-sm font-medium text-gray-700 mt-3">Price</label>
                        <input
                          className="mt-1 block w-40 border px-3 py-2 rounded"
                          value={room.price || ''}
                          onChange={(e) => setRooms(prev => prev.map(r => r._id === room._id ? { ...r, price: e.target.value } : r))}
                        />

                        <label className="block text-sm font-medium text-gray-700 mt-3">Image URL</label>
                        <input
                          className="mt-1 block w-full border px-3 py-2 rounded"
                          value={room.img || room.image || ''}
                          onChange={(e) => setRooms(prev => prev.map(r => r._id === room._id ? { ...r, img: e.target.value, image: e.target.value } : r))}
                        />
                      </div>

                      <div className="flex-shrink-0 flex items-center gap-3">
                        <button
                          onClick={() => handleSaveRoom(room._id, { title: room.title, price: room.price, img: room.img || room.image })}
                          className="bg-[#b89b5e] text-white px-4 py-2 rounded hover:bg-[#a6853e]"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => fetchRooms()}
                          className="bg-gray-100 px-3 py-2 rounded text-sm"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
