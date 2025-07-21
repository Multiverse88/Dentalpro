import React from 'react';

export default function LoginForm({ onLogin }: { onLogin?: (username: string, password: string) => void }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setError(null);
    onLogin?.(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        {/* Logo and Title */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-12 h-12 mb-2 bg-blue-100 rounded-full flex items-center justify-center">
            {/* Placeholder for logo */}
            <span className="text-2xl font-bold text-blue-600">DR</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">DentalRecord</h1>
          <p className="text-gray-500 text-sm">Sign in to continue to DentalRecord</p>
        </div>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Username</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-gray-600 text-sm">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              Remember me
            </label>
            <a href="#" className="text-blue-600 text-sm hover:underline">Forgot your password?</a>
          </div>
          {error && <div className="text-red-500 text-sm font-semibold text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow mt-2 transition"
          >
            Log In
          </button>
        </form>
        <div className="mt-6 text-center text-gray-500 text-sm">
          Don't have an account?{' '}
          <a href="#" className="text-blue-600 font-semibold hover:underline">Signup</a>
        </div>
      </div>
    </div>
  );
}
