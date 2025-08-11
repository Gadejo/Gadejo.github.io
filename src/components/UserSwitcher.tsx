import { useState, useRef, useEffect } from 'react';
import { authService } from '../services/auth';
import type { PublicUser } from '../types/auth';

interface UserSwitcherProps {
  currentUser: any;
  onSwitchUser: () => void;
  onLogout: () => void;
}

export default function UserSwitcher({ currentUser, onSwitchUser, onLogout }: UserSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<PublicUser[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAvailableUsers = async () => {
    try {
      const users = await authService.getAvailableUsers();
      setAvailableUsers(users.filter(user => user.id !== currentUser?.id));
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        title={`${currentUser?.displayName} (${currentUser?.email})`}
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {currentUser?.avatarUrl ? (
            <img 
              src={currentUser.avatarUrl} 
              alt="" 
              className="w-full h-full rounded-full object-cover" 
            />
          ) : (
            getUserInitials(currentUser?.displayName || 'U')
          )}
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-32 truncate">
          {currentUser?.displayName}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Current User Section */}
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                {currentUser?.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  getUserInitials(currentUser?.displayName || 'U')
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {currentUser?.displayName}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {currentUser?.email}
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-xs text-blue-600">
                    Lvl {currentUser?.level || 1}
                  </span>
                  <span className="text-xs text-green-600">
                    🔥 {currentUser?.currentStreak || 0}
                  </span>
                  <span className="text-xs text-purple-600">
                    {formatStudyTime(currentUser?.totalStudyTime || 0)}
                  </span>
                </div>
              </div>
              <div className="text-green-500 text-xs font-medium bg-green-100 px-2 py-1 rounded">
                Active
              </div>
            </div>
          </div>

          {/* Available Users Section */}
          {availableUsers.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Switch to:
                </p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setIsOpen(false);
                      onSwitchUser();
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt="" 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        getUserInitials(user.displayName)
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-blue-600">
                          🔥 {user.currentStreak}
                        </span>
                        <span className="text-xs text-purple-600">
                          {formatStudyTime(user.totalStudyTime)}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Actions Section */}
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                onSwitchUser();
              }}
              className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded focus:outline-none focus:bg-gray-100 transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm text-gray-700">Add/Switch User</span>
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center space-x-2 p-2 text-left hover:bg-red-50 rounded focus:outline-none focus:bg-red-50 transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-sm text-red-600">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}