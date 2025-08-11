import { useState } from 'react';
import { authService } from '../services/auth';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter a password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // This is for backward compatibility - AuthScreen is the new component
      await authService.login({ email: 'legacy@example.com', password });
      onLogin();
    } catch (err: any) {
      if (err.message.includes('No user found') || err.message.includes('first time')) {
        setIsFirstTime(true);
        onLogin(); // First time setup, proceed
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🧠</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ADHD Learning RPG
          </h1>
          <p className="text-gray-600">
            Enter your password to access your learning journey
          </p>
        </div>

        {isFirstTime && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-2">✨</div>
              <div>
                <p className="text-green-800 font-medium">First time setup!</p>
                <p className="text-green-700 text-sm">
                  This password will be used to secure your data.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isFirstTime ? 'Setting up...' : 'Signing in...'}
              </div>
            ) : (
              isFirstTime ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              💡 This is a private, single-user app
            </p>
            <p className="text-xs text-gray-400">
              Your data is stored securely and only accessible with your password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}