import React, { useState } from 'react';
import { migrateLocalStorageToD1, hasLocalStorageData } from '../utils/storage';

interface DataMigrationProps {
  onMigrationComplete: () => void;
}

export default function DataMigration({ onMigrationComplete }: DataMigrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasExistingData = hasLocalStorageData();

  const handleMigrate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await migrateLocalStorageToD1();
      setSuccess(true);
      setTimeout(() => {
        onMigrationComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Migration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onMigrationComplete();
  };

  if (!hasExistingData) {
    // No data to migrate, proceed directly
    setTimeout(onMigrationComplete, 0);
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-800 mb-4">
            Migration Complete!
          </h1>
          <p className="text-green-600">
            Your data has been successfully migrated to the cloud.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Migrate Your Data
          </h1>
          <p className="text-gray-600">
            We found existing data in your browser. Would you like to migrate it to the cloud for cross-device sync?
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-800 mb-2">What will be migrated:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Your learning progress and XP</li>
            <li>• Study sessions and streaks</li>
            <li>• Goals and achievements</li>
            <li>• Custom subjects and templates</li>
            <li>• Daily pip tracking data</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleMigrate}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Migrating...
              </div>
            ) : (
              'Migrate Data'
            )}
          </button>
          
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Start Fresh
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 You can always export and import your data later if needed
          </p>
        </div>
      </div>
    </div>
  );
}