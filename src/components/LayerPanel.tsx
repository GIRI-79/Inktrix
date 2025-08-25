import React from 'react';
import { Eye, EyeOff, Plus, Trash2, Move } from 'lucide-react';
import { DrawingLayer } from '../types';

interface LayerPanelProps {
  layers: DrawingLayer[];
  activeLayerId: string;
  onLayerSelect: (layerId: string) => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  isVisible: boolean;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerVisibilityToggle,
  onLayerOpacityChange,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-left-2 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Move className="w-5 h-5" />
          Layers
        </h3>
        <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group">
          <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {layers.slice().reverse().map((layer, index) => (
          <div
            key={layer.id}
            className={`group p-4 rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
              activeLayerId === layer.id
                ? 'bg-indigo-500/30 border-indigo-400/50 shadow-lg shadow-indigo-500/20'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
            onClick={() => onLayerSelect(layer.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  activeLayerId === layer.id ? 'bg-indigo-400' : 'bg-white/30'
                }`} />
                <span className="font-medium text-white">{layer.name}</span>
                <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">
                  {layers.length - index}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerVisibilityToggle(layer.id);
                  }}
                  className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                    layer.visible 
                      ? 'hover:bg-white/20 text-white' 
                      : 'hover:bg-red-500/20 text-white/30'
                  }`}
                >
                  {layer.visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Opacity</span>
                <span className="font-mono">{Math.round(layer.opacity * 100)}%</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={layer.opacity}
                  onChange={(e) => onLayerOpacityChange(layer.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer opacity-slider"
                  onClick={(e) => e.stopPropagation()}
                />
                <div 
                  className="absolute top-0 left-0 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg pointer-events-none transition-all duration-200"
                  style={{ width: `${layer.opacity * 100}%` }}
                />
              </div>
            </div>

            {/* Layer Preview */}
            <div className="mt-3 p-2 bg-white/5 rounded-lg border border-white/10">
              <div className="w-full h-8 bg-gradient-to-r from-white/10 to-white/5 rounded border border-white/20 flex items-center justify-center">
                <span className="text-xs text-white/50">Layer Preview</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .opacity-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid rgba(99, 102, 241, 0.5);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .opacity-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid rgba(99, 102, 241, 0.5);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};