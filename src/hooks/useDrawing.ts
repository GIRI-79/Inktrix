import { useState, useRef, useCallback, useEffect } from 'react';
import { DrawingLayer, DrawingState, Point, DrawingTool, ShapeType } from '../types';

export const useDrawing = () => {
  const [layers, setLayers] = useState<DrawingLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('');
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [shapeType, setShapeType] = useState<ShapeType>('rectangle');
  const [undoStack, setUndoStack] = useState<DrawingState[]>([]);
  const [redoStack, setRedoStack] = useState<DrawingState[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const startPoint = useRef<Point | null>(null);

  const initializeLayers = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const layerNames = ['Background', 'Sketch', 'Details'];
    const newLayers: DrawingLayer[] = layerNames.map((name, index) => {
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = canvas.width;
      layerCanvas.height = canvas.height;
      const context = layerCanvas.getContext('2d')!;
      
      // Set white background for the background layer
      if (index === 0) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, layerCanvas.width, layerCanvas.height);
      }
      
      return {
        id: `layer-${index}`,
        name,
        visible: true,
        opacity: 1.0,
        canvas: layerCanvas,
        context
      };
    });

    setLayers(newLayers);
    setActiveLayerId(newLayers[1].id); // Default to Sketch layer
    
    // Save initial state
    setTimeout(() => {
      saveInitialState(newLayers[1]);
    }, 100);
  }, []);

  const saveInitialState = useCallback((layer: DrawingLayer) => {
    const state: DrawingState = {
      imageData: layer.canvas.toDataURL(),
      layerId: layer.id,
      timestamp: Date.now()
    };
    setUndoStack([state]);
  }, []);

  const getActiveLayer = useCallback(() => {
    return layers.find(layer => layer.id === activeLayerId);
  }, [layers, activeLayerId]);

  const saveState = useCallback(() => {
    const activeLayer = getActiveLayer();
    if (!activeLayer) return;

    const state: DrawingState = {
      imageData: activeLayer.canvas.toDataURL(),
      layerId: activeLayerId,
      timestamp: Date.now()
    };

    setUndoStack(prev => [...prev, state]);
    setRedoStack([]);
  }, [getActiveLayer, activeLayerId]);

  const undo = useCallback(() => {
    if (undoStack.length > 1) {
      const currentState = undoStack[undoStack.length - 1];
      const previousState = undoStack[undoStack.length - 2];
      
      setRedoStack(prev => [...prev, currentState]);
      setUndoStack(prev => prev.slice(0, -1));
      
      const layer = layers.find(l => l.id === previousState.layerId);
      if (layer) {
        const img = new Image();
        img.onload = () => {
          layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
          layer.context.drawImage(img, 0, 0);
          renderLayers();
        };
        img.src = previousState.imageData;
      }
    }
  }, [undoStack, layers]);

  const redo = useCallback(() => {
    if (redoStack.length > 0) {
      const state = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, state]);
      setRedoStack(prev => prev.slice(0, -1));
      
      const layer = layers.find(l => l.id === state.layerId);
      if (layer) {
        const img = new Image();
        img.onload = () => {
          layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
          layer.context.drawImage(img, 0, 0);
          renderLayers();
        };
        img.src = state.imageData;
      }
    }
  }, [redoStack, layers]);

  const renderLayers = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render layers in order
    layers.forEach(layer => {
      if (layer.visible) {
        ctx.globalAlpha = layer.opacity;
        ctx.drawImage(layer.canvas, 0, 0);
      }
    });

    ctx.globalAlpha = 1.0;
  }, [layers]);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showGrid) return;

    const ctx = canvas.getContext('2d')!;
    const gridSize = 20;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  }, [showGrid]);

  const exportCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas for export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d')!;

    // Render all visible layers to export canvas
    layers.forEach(layer => {
      if (layer.visible) {
        exportCtx.globalAlpha = layer.opacity;
        exportCtx.drawImage(layer.canvas, 0, 0);
      }
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `macpen-studio-${new Date().getTime()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [layers]);

  const clearActiveLayer = useCallback(() => {
    const activeLayer = getActiveLayer();
    if (!activeLayer) return;

    activeLayer.context.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
    
    // If it's the background layer, fill with white
    if (activeLayer.name === 'Background') {
      activeLayer.context.fillStyle = '#ffffff';
      activeLayer.context.fillRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
    }
    
    renderLayers();
    saveState();
  }, [getActiveLayer, renderLayers, saveState]);

  useEffect(() => {
    renderLayers();
    if (showGrid) {
      drawGrid();
    }
  }, [renderLayers, drawGrid]);

  return {
    layers,
    setLayers,
    activeLayerId,
    setActiveLayerId,
    currentTool,
    setCurrentTool,
    currentColor,
    setCurrentColor,
    brushSize,
    setBrushSize,
    shapeType,
    setShapeType,
    undoStack,
    redoStack,
    isDrawing,
    setIsDrawing,
    showGrid,
    setShowGrid,
    canvasRef,
    previewCanvasRef,
    startPoint,
    initializeLayers,
    getActiveLayer,
    saveState,
    undo,
    redo,
    renderLayers,
    exportCanvas,
    clearActiveLayer
  };
};