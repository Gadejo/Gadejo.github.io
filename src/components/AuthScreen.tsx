import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import type { LoginCredentials, RegisterData, PublicUser } from '../types/auth';

interface AuthScreenProps {
  onLogin: (showMigration: boolean) => void;
}

type AuthMode = 'select' | 'login' | 'register';

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('select');
  const [availableUsers, setAvailableUsers] = useState<PublicUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [loginData, setLoginData] = useState<LoginCredentials>({ email: '', password: '' });
  const [registerData, setRegisterData] = useState<RegisterData>({ 
    email: '', 
    password: '', 
    displayName: '' 
  });

  useEffect(() => {
    loadAvailableUsers();
  }, []);

  const loadAvailableUsers = async () => {
    try {
      const users = await authService.getAvailableUsers();
      setAvailableUsers(users);
      
      if (users.length === 0) {
        setMode('register');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setMode('register');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.login(loginData);
      const shouldShowMigration = localStorage.getItem('modular-learning-rpg') !== null;
      onLogin(shouldShowMigration);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.email || !registerData.password || !registerData.displayName) {
      setError('All fields are required');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.register(registerData);
      const shouldShowMigration = localStorage.getItem('modular-learning-rpg') !== null;
      onLogin(shouldShowMigration);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = async (user: PublicUser) => {
    setLoginData({ email: user.email, password: '' });
    setMode('login');
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🧠</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ADHD Learning RPG
            </h1>
            <p className="text-gray-600 text-sm">
              Transform your learning into an adventure
            </p>
          </div>

          {/* Available Users */}
          {availableUsers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Choose Your Character</h2>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="w-full flex items-center p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 group-hover:scale-110 transition-transform duration-200">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{user.displayName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          🔥 {user.currentStreak} streak
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Level 1
                        </span>
                      </div>
                    </div>
                    <div className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setMode('register')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ✨ Create New Character
            </button>
            
            {availableUsers.length > 0 && (
              <button
                onClick={() => setMode('login')}
                className="w-full bg-white text-gray-700 py-3 px-6 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
              >
                🔐 Login with Email
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600 text-sm">
              Enter your credentials to continue your journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                '🚀 Launch Adventure'
              )}
            </button>

            <button
              type="button"
              onClick={() => setMode('select')}
              className="w-full text-gray-600 py-2 px-4 rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              ← Back to Character Select
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Create Your Character
            </h1>
            <p className="text-gray-600 text-sm">
              Start your personalized learning adventure
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Character Name</label>
              <input
                type="text"
                value={registerData.displayName}
                onChange={(e) => setRegisterData({ ...registerData, displayName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Choose your character name"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Create a strong password (6+ chars)"
                disabled={isLoading}
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating character...</span>
                </div>
              ) : (
                '🎮 Begin Adventure'
              )}
            </button>

            {availableUsers.length > 0 && (
              <button
                type="button"
                onClick={() => setMode('select')}
                className="w-full text-gray-600 py-2 px-4 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                ← Back to Character Select
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return null;
}