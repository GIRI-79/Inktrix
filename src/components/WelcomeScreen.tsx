import React, { useEffect } from 'react';

interface WelcomeScreenProps {
  isVisible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ isVisible, onClose, isDarkMode }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`relative p-12 backdrop-blur-xl rounded-3xl border shadow-2xl transition-all duration-500 animate-in fade-in ${
        isDarkMode 
          ? 'bg-gray-800/90 border-gray-700/50' 
          : 'bg-white/90 border-gray-200/50'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl" />
        
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 animate-pulse">
            Welcome to Inktrix
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
};