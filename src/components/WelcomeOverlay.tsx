import React from 'react';
import { Palette, Layers, Mic, Grid, Download } from 'lucide-react';

interface WelcomeOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  const features = [
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Multi-Layer System",
      description: "Professional layer management with opacity controls"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Advanced Tools",
      description: "Shapes, text, highlighter, and custom brushes"
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Notes",
      description: "Record and manage audio annotations"
    },
    {
      icon: <Grid className="w-6 h-6" />,
      title: "Precision Grid",
      description: "Snap to grid for perfect alignment"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Export & Save",
      description: "High-quality PNG export functionality"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-2xl mx-4 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl" />
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              MacPen Studio
            </h1>
            <p className="text-lg text-white/80">
              Professional notepad with advanced drawing capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-indigo-400">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-white/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Creating
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};