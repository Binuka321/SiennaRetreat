import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

// Vite exposes env variables on import.meta.env. Use VITE_API_BASE to allow overriding in dev/prod.
const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';

const Auth: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setUser, setToken } = useContext(AuthContext);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const url = `${API_BASE}/api/auth/${mode}`;
      const body: any = { password };
      if (mode === 'login') {
        if (username) body.username = username;
        else body.email = email;
      } else {
        if (username) body.username = username;
        if (email) body.email = email;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Auth failed');

      // store token and user
      const token = data.token || data?.token;
      const user = data.user || null;
      if (token) setToken(token);
      if (user) setUser(user);
      setMessage(mode === 'login' ? 'Logged in' : 'Registered');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setMessage(err.message || 'Failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{mode === 'login' ? 'Log In' : 'Register'}</h3>
          <div>
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-sm mr-2">
              {mode === 'login' ? 'Switch to Register' : 'Switch to Login'}
            </button>
            <button onClick={onClose} className="text-sm">Close</button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border px-2 py-1 rounded" />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-2 py-1 rounded" />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-2 py-1 rounded" />
          </div>

          {message && <div className="text-sm text-red-600">{message}</div>}

          <div className="flex justify-end">
            <button type="submit" className="bg-[#b89b5e] text-white px-4 py-2 rounded">{mode === 'login' ? 'Log In' : 'Register'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
