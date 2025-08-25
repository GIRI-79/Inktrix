import React, { useState } from 'react';
import { 
  Pen, 
  Eraser, 
  Square, 
  Circle, 
  Triangle, 
  Highlighter, 
  Undo2, 
  Redo2, 
  Download, 
  Trash2,
  Sun,
  Moon,
  Palette,
  Settings
} from 'lucide-react';
import { DrawingTool, PenType, ShapeType } from '../types';

interface ToolbarProps {
  isVisible: boolean;
  onToggle: () => void;
  currentTool: DrawingTool;
  currentColor: string;
  penSize: number;
  penType: PenType;
  shapeType: ShapeType;
  isDarkMode: boolean;
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
  onPenSizeChange: (size: number) => void;
  onPenTypeChange: (type: PenType) => void;
  onShapeTypeChange: (shape: ShapeType) => void;
  onThemeToggle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  undoAvailable: boolean;
  redoAvailable: boolean;
  onCanvasResize: (direction: 'width' | 'height', delta: number) => void;
  canvasSize: { width: number; height: number };
}

export const Toolbar: React.FC<ToolbarProps> = ({
  isVisible,
  onToggle,
  currentTool,
  currentColor,
  penSize,
  penType,
  shapeType,
  isDarkMode,
  onToolChange,
  onColorChange,
  onPenSizeChange,
  onPenTypeChange,
  onShapeTypeChange,
  onThemeToggle,
  onUndo,
  onRedo,
  onClear,
  onExport,
  undoAvailable,
  redoAvailable,
  onCanvasResize,
  canvasSize
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const predefinedColors = [
    '#000000', '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC02', '#34C759',
    '#007AFF', '#5856D6', '#AF52DE', '#FF2D92', '#A2845E', '#8E8E93'
  ];

  const tools = [
    { id: 'pen' as DrawingTool, icon: Pen, label: 'Pen', shortcut: 'P' },
    { id: 'eraser' as DrawingTool, icon: Eraser, label: 'Eraser', shortcut: 'E' },
    { id: 'highlighter' as DrawingTool, icon: Highlighter, label: 'Highlighter', shortcut: 'H' },
    { id: 'shapes' as DrawingTool, icon: Square, label: 'Shapes', shortcut: 'S' }
  ];

  const shapes = [
    { id: 'rectangle' as ShapeType, icon: Square, label: 'Rectangle' },
    { id: 'circle' as ShapeType, icon: Circle, label: 'Circle' },
    { id: 'triangle' as ShapeType, icon: Triangle, label: 'Triangle' }
  ];

  const penTypes = [
    { id: 'normal' as PenType, label: 'Normal' },
    { id: 'marker' as PenType, label: 'Marker' },
    { id: 'highlighter' as PenType, label: 'Highlighter' }
  ];

  return (
    <>
      {/* Theme Toggle - Top Left */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={onThemeToggle}
          className={`group relative p-4 backdrop-blur-xl rounded-2xl border transition-all duration-500 hover:scale-105 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-700/80' 
              : 'bg-white/80 border-gray-200/50 hover:bg-gray-50/80'
          }`}
          title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          <div className="relative w-6 h-6">
            <Sun 
              className={`absolute inset-0 w-6 h-6 text-amber-500 transition-all duration-500 ${
                isDarkMode ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'
              }`} 
            />
            <Moon 
              className={`absolute inset-0 w-6 h-6 text-blue-400 transition-all duration-500 ${
                isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'
              }`} 
            />
          </div>
        </button>
      </div>

      {/* Toolbar Toggle - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={onToggle}
          className={`group relative px-6 py-4 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-700/80 text-white' 
              : 'bg-white/80 border-gray-200/50 hover:bg-gray-50/80 text-gray-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Tools</span>
          </div>
        </button>
      </div>

      {/* Main Toolbar */}
      <div className={`fixed top-20 right-6 z-40 transition-all duration-300 transform-gpu ${
        isVisible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
      }`}>
        <div className={`backdrop-blur-xl rounded-3xl border shadow-2xl p-6 w-80 ${
          isDarkMode 
            ? 'bg-gray-800/90 border-gray-700/50' 
            : 'bg-white/90 border-gray-200/50'
        }`}>
          
          {/* Drawing Tools */}
          <div className="mb-6">
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Drawing Tools
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = currentTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => onToolChange(tool.id)}
                    className={`relative p-4 rounded-xl transition-all duration-300 transform hover:scale-105 group ${
                      isActive 
                        ? 'bg-blue-500 shadow-lg shadow-blue-500/30 text-white' 
                        : isDarkMode
                          ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white'
                          : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
                    }`}
                    title={`${tool.label} (${tool.shortcut})`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">{tool.label}</div>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shape Tools (visible when shapes tool is active) */}
          {currentTool === 'shapes' && (
            <div className="mb-6">
              <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Shape Type
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {shapes.map((shape) => {
                  const Icon = shape.icon;
                  const isActive = shapeType === shape.id;
                  return (
                    <button
                      key={shape.id}
                      onClick={() => onShapeTypeChange(shape.id)}
                      className={`p-3 rounded-lg transition-all duration-300 ${
                        isActive 
                          ? 'bg-green-500 shadow-lg text-white'
                          : isDarkMode
                            ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
                            : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600'
                      }`}
                      title={shape.label}
                    >
                      <Icon className="w-4 h-4 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Picker */}
          <div className="mb-6">
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Color
            </h3>
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`w-full h-12 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                }`}
                style={{ backgroundColor: currentColor }}
                title="Color Picker"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              {showColorPicker && (
                <div className={`absolute top-16 left-0 right-0 backdrop-blur-xl rounded-2xl border shadow-2xl p-4 z-50 ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-700/50' 
                    : 'bg-white/90 border-gray-200/50'
                }`}>
                  <div className="grid grid-cols-6 gap-2 mb-3">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          onColorChange(color);
                          setShowColorPicker(false);
                        }}
                        className="w-8 h-8 rounded-lg border border-gray-300 hover:border-gray-500 transition-all duration-200 transform hover:scale-110 shadow-md"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pen Settings */}
          <div className="mb-6">
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Pen Settings
            </h3>
            
            {/* Pen Size */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Size</span>
                <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{penSize}px</span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={penSize}
                  onChange={(e) => onPenSizeChange(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 transition-all duration-200"
                  style={{ 
                    width: `${Math.max(Math.min(penSize, 24), 8)}px`, 
                    height: `${Math.max(Math.min(penSize, 24), 8)}px`,
                    backgroundColor: currentColor 
                  }}
                />
              </div>
            </div>

            {/* Pen Type */}
            <div>
              <span className={`text-sm mb-2 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type</span>
              <select
                value={penType}
                onChange={(e) => onPenTypeChange(e.target.value as PenType)}
                className={`w-full p-3 rounded-lg border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                {penTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Canvas Size Controls */}
          <div className="mb-6">
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Canvas Size
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Width</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onCanvasResize('width', -50)}
                    className={`w-8 h-8 rounded-lg transition-all duration-300 hover:scale-105 ${
                      isDarkMode
                        ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
                        : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600'
                    }`}
                  >
                    -
                  </button>
                  <span className={`text-xs font-mono w-16 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {canvasSize.width}px
                  </span>
                  <button
                    onClick={() => onCanvasResize('width', 50)}
                    className={`w-8 h-8 rounded-lg transition-all duration-300 hover:scale-105 ${
                      isDarkMode
                        ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
                        : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Height</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onCanvasResize('height', -50)}
                    className={`w-8 h-8 rounded-lg transition-all duration-300 hover:scale-105 ${
                      isDarkMode
                        ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
                        : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600'
                    }`}
                  >
                    -
                  </button>
                  <span className={`text-xs font-mono w-16 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {canvasSize.height}px
                  </span>
                  <button
                    onClick={() => onCanvasResize('height', 50)}
                    className={`w-8 h-8 rounded-lg transition-all duration-300 hover:scale-105 ${
                      isDarkMode
                        ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
                        : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onUndo}
                disabled={!undoAvailable}
                className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 ${
                  isDarkMode
                    ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white'
                    : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">Undo</div>
              </button>
              <button
                onClick={onRedo}
                disabled={!redoAvailable}
                className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 ${
                  isDarkMode
                    ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white'
                    : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">Redo</div>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onClear}
                className="p-3 rounded-xl transition-all duration-300 transform hover:scale-105 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300"
                title="Clear Canvas"
              >
                <Trash2 className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">Clear</div>
              </button>
              <button
                onClick={onExport}
                className="p-3 rounded-xl transition-all duration-300 transform hover:scale-105 bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300"
                title="Export as PNG"
              >
                <Download className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">Export</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  );
};