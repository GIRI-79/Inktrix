import React, { useState, useEffect, useCallback, useRef } from "react";
import { Toolbar } from "./components/Toolbar";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Point, DrawingTool, PenType, ShapeType } from "./types";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isResizing, setIsResizing] = useState(false);

  const [currentTool, setCurrentTool] = useState<DrawingTool>("pen");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [penSize, setPenSize] = useState(4);
  const [penType, setPenType] = useState<PenType>("normal");
  const [shapeType, setShapeType] = useState<ShapeType>("rectangle");
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewContextRef = useRef<CanvasRenderingContext2D | null>(null);

  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL();
    setUndoStack((prev) => [...prev, dataURL]);
    setRedoStack([]);
  }, []);

  const captureCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    try {
      return {
        imageData: canvas.toDataURL("image/png"),
        width: canvas.width,
        height: canvas.height,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Failed to capture canvas state:", error);
      return null;
    }
  }, []);

  const restoreCanvasState = useCallback(
    (
      state: {
        imageData: string;
        width: number;
        height: number;
        timestamp: number;
      } | null,
      newWidth: number,
      newHeight: number
    ) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context || !state) return;

      try {
        const img = new Image();
        img.onload = () => {
          context.fillStyle = isDarkMode ? "#1f2937" : "#ffffff";
          context.fillRect(0, 0, newWidth, newHeight);
          context.drawImage(img, 0, 0);

          setTimeout(() => {
            saveState();
          }, 50);
        };
        img.onerror = (error) => {
          console.error("Failed to restore canvas state:", error);
          context.fillStyle = isDarkMode ? "#1f2937" : "#ffffff";
          context.fillRect(0, 0, newWidth, newHeight);
          setTimeout(() => {
            saveState();
          }, 50);
        };
        img.src = state.imageData;
      } catch (error) {
        console.error("Failed to restore canvas state:", error);
        context.fillStyle = isDarkMode ? "#1f2937" : "#ffffff";
        context.fillRect(0, 0, newWidth, newHeight);
        setTimeout(() => {
          saveState();
        }, 50);
      }
    },
    [isDarkMode, saveState]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;

    const resizeCanvas = () => {
      const currentState =
        canvas.width > 0 && canvas.height > 0 ? captureCanvasState() : null;

      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      const context = canvas.getContext("2d");
      if (context) {
        context.lineCap = "round";
        context.lineJoin = "round";
        contextRef.current = context;

        if (currentState) {
          restoreCanvasState(currentState, canvasSize.width, canvasSize.height);
        } else {
          context.fillStyle = isDarkMode ? "#1f2937" : "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          saveState();
        }
      }

      previewCanvas.width = canvasSize.width;
      previewCanvas.height = canvasSize.height;

      const previewContext = previewCanvas.getContext("2d");
      if (previewContext) {
        previewContext.lineCap = "round";
        previewContext.lineJoin = "round";
        previewContextRef.current = previewContext;
      }
    };

    const timeoutId = setTimeout(() => {
      resizeCanvas();
      setIsResizing(false);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [
    isDarkMode,
    canvasSize,
    captureCanvasState,
    restoreCanvasState,
    saveState,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempContext = tempCanvas.getContext("2d")!;

    tempContext.fillStyle = isDarkMode ? "#1f2937" : "#ffffff";
    tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempContext.putImageData(imageData, 0, 0);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(tempCanvas, 0, 0);

    setCurrentColor(isDarkMode ? "#ffffff" : "#000000");
  }, [isDarkMode]);

  useEffect(() => {
    if (isDrawing) {
      setShowToolbar(false);
    }
  }, [isDrawing]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length > 1) {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      const currentState = undoStack[undoStack.length - 1];
      const previousState = undoStack[undoStack.length - 2];

      setRedoStack((prev) => [...prev, currentState]);
      setUndoStack((prev) => prev.slice(0, -1));

      const img = new Image();
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };
      img.src = previousState;
    }
  }, [undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length > 0) {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      const state = redoStack[redoStack.length - 1];
      setUndoStack((prev) => [...prev, state]);
      setRedoStack((prev) => prev.slice(0, -1));

      const img = new Image();
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };
      img.src = state;
    }
  }, [redoStack]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.fillStyle = isDarkMode ? "#1f2937" : "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, [saveState, isDarkMode]);

  const exportCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `notepad-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const getMousePos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const drawShapePreview = useCallback(
    (start: Point, end: Point) => {
      const previewContext = previewContextRef.current;
      if (!previewContext) return;

      previewContext.clearRect(
        0,
        0,
        previewContext.canvas.width,
        previewContext.canvas.height
      );
      previewContext.strokeStyle = currentColor;
      previewContext.lineWidth = penSize;
      previewContext.setLineDash([5, 5]);
      previewContext.globalAlpha = 0.8;

      previewContext.beginPath();

      switch (shapeType) {
        case "rectangle":
          const width = end.x - start.x;
          const height = end.y - start.y;
          previewContext.rect(start.x, start.y, width, height);
          break;
        case "circle":
          const radius = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
          );
          previewContext.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          break;
        case "triangle":
          previewContext.moveTo(start.x, start.y);
          previewContext.lineTo(end.x, end.y);
          previewContext.lineTo(start.x - (end.x - start.x), end.y);
          previewContext.closePath();
          break;
      }

      previewContext.stroke();
      previewContext.setLineDash([]);
      previewContext.globalAlpha = 1.0;
    },
    [currentColor, penSize, shapeType]
  );

  const drawShape = useCallback(
    (start: Point, end: Point) => {
      const context = contextRef.current;
      if (!context) return;

      context.strokeStyle = currentColor;
      context.lineWidth = penSize;
      context.globalAlpha = 1.0;
      context.globalCompositeOperation = "source-over";

      context.beginPath();

      switch (shapeType) {
        case "rectangle":
          const width = end.x - start.x;
          const height = end.y - start.y;
          context.rect(start.x, start.y, width, height);
          break;
        case "circle":
          const radius = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
          );
          context.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          break;
        case "triangle":
          context.moveTo(start.x, start.y);
          context.lineTo(end.x, end.y);
          context.lineTo(start.x - (end.x - start.x), end.y);
          context.closePath();
          break;
      }

      context.stroke();
    },
    [currentColor, penSize, shapeType]
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const context = contextRef.current;
      if (!context) return;

      setIsDrawing(true);
      const pos = getMousePos(e);

      if (currentTool === "shapes") {
        setStartPoint(pos);
        return;
      }

      setCurrentPath([pos]);

      context.beginPath();
      context.moveTo(pos.x, pos.y);
      if (currentTool === "eraser") {
        context.globalCompositeOperation = "destination-out";
        context.globalAlpha = 1.0;
        context.lineWidth = penSize;
        context.strokeStyle = currentColor;
      } else if (currentTool === "highlighter") {
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 0.4;
        context.lineWidth = penSize * 2; // Highlighter is wider
        context.strokeStyle = currentColor;
        context.lineCap = "round";
      } else if (currentTool === "pen") {
        context.globalCompositeOperation = "source-over";

        if (penType === "marker") {
          context.globalAlpha = 0.9;
          context.lineWidth = penSize * 1.5; // Marker is thicker
          context.strokeStyle = currentColor;
          context.lineCap = "round";
          context.lineJoin = "round";
        } else if (penType === "highlighter") {
          context.globalAlpha = 0.4;
          context.lineWidth = penSize * 2.5; // Highlighter is much wider
          context.strokeStyle = currentColor;
          context.lineCap = "round";
        } else {
          context.globalAlpha = 1.0;
          context.lineWidth = penSize;
          context.strokeStyle = currentColor;
          context.lineCap = "round";
        }
      } else {
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 1.0;
        context.lineWidth = penSize;
        context.strokeStyle = currentColor;
      }
    },
    [getMousePos, penSize, currentColor, currentTool, penType]
  );

  // Draw
  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const pos = getMousePos(e);

      if (currentTool === "shapes" && startPoint) {
        drawShapePreview(startPoint, pos);
        return;
      }

      const context = contextRef.current;
      if (!context) return;

      setCurrentPath((prev) => [...prev, pos]);

      context.lineTo(pos.x, pos.y);
      context.stroke();
      context.beginPath();
      context.moveTo(pos.x, pos.y);
    },
    [isDrawing, getMousePos, currentTool, startPoint, drawShapePreview]
  );

  const stopDrawing = useCallback(
    (e?: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const context = contextRef.current;
      const previewContext = previewContextRef.current;
      if (!context) return;

      if (currentTool === "shapes" && startPoint && e) {
        const endPoint = getMousePos(e);
        drawShape(startPoint, endPoint);
        if (previewContext) {
          previewContext.clearRect(
            0,
            0,
            previewContext.canvas.width,
            previewContext.canvas.height
          );
        }
        setStartPoint(null);
      }

      setIsDrawing(false);
      setCurrentPath([]);
      context.beginPath();
      context.globalAlpha = 1.0;
      context.globalCompositeOperation = "source-over";

      saveState();
    },
    [
      isDrawing,
      currentTool,
      startPoint,
      currentPath,
      getMousePos,
      drawShape,
      saveState,
      currentColor,
      penSize,
      penType,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case "y":
            e.preventDefault();
            redo();
            break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case "p":
            setCurrentTool("pen");
            break;
          case "e":
            setCurrentTool("eraser");
            break;
          case "h":
            setCurrentTool("highlighter");
            break;
          case "s":
            setCurrentTool("shapes");
            break;
          case "t":
            setShowToolbar(!showToolbar);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, showToolbar]);

  // Get cursor style
  const getCursorStyle = () => {
    switch (currentTool) {
      case "pen":
        return "crosshair";
      case "highlighter":
        return "crosshair";
      case "eraser":
        return `url("data:image/svg+xml,%3csvg width='${
          penSize + 10
        }' height='${
          penSize + 10
        }' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='${
          (penSize + 10) / 2
        }' cy='${(penSize + 10) / 2}' r='${
          penSize / 2
        }' fill='none' stroke='%23666' stroke-width='1'/%3e%3c/svg%3e") ${
          (penSize + 10) / 2
        } ${(penSize + 10) / 2}, auto`;
      case "shapes":
        return "crosshair";
      default:
        return "default";
    }
  };

  // Resize canvas
  const resizeCanvas = useCallback(
    (direction: "width" | "height", delta: number) => {
      setCanvasSize((prev) => ({
        ...prev,
        [direction]: Math.max(400, prev[direction] + delta),
      }));
    },
    []
  );

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      {/* Welcome Screen */}
      <WelcomeScreen
        isVisible={showWelcome}
        onClose={() => setShowWelcome(false)}
        isDarkMode={isDarkMode}
      />

      {/* Toolbar */}
      <Toolbar
        isVisible={showToolbar}
        onToggle={() => setShowToolbar(!showToolbar)}
        currentTool={currentTool}
        currentColor={currentColor}
        penSize={penSize}
        penType={penType}
        shapeType={shapeType}
        isDarkMode={isDarkMode}
        onToolChange={setCurrentTool}
        onColorChange={setCurrentColor}
        onPenSizeChange={setPenSize}
        onPenTypeChange={setPenType}
        onShapeTypeChange={setShapeType}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        onUndo={undo}
        onRedo={redo}
        onClear={clearCanvas}
        onExport={exportCanvas}
        undoAvailable={undoStack.length > 1}
        redoAvailable={redoStack.length > 0}
        onCanvasResize={resizeCanvas}
        canvasSize={canvasSize}
      />

      {/* Main Canvas */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <div
          className={`relative border-2 border-dashed transition-all duration-300 ${
            isDarkMode ? "border-gray-600" : "border-gray-300"
          }`}
          style={{
            width: canvasSize.width + "px",
            height: canvasSize.height + "px",
            minWidth: "400px",
            minHeight: "300px",
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-10 rounded-lg shadow-2xl"
            style={{ cursor: getCursorStyle() }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          {/* Resize handles */}
          {/* Right edge handle */}
          <div
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-12 bg-blue-500 rounded-lg cursor-ew-resize opacity-70 hover:opacity-100 hover:bg-blue-400 transition-all duration-200 shadow-lg border-2 border-white"
            title="Drag to resize width"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              const startX = e.clientX;
              const startWidth = canvasSize.width;

              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX;
                const newWidth = Math.max(
                  400,
                  Math.min(2000, startWidth + deltaX)
                ); // Add max constraint
                setCanvasSize((prev) => ({ ...prev, width: newWidth }));
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                // Save state after resize is complete
                setTimeout(() => {
                  saveState();
                  setIsResizing(false);
                }, 100);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />

          {/* Left edge handle */}
          <div
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-12 bg-blue-500 rounded-lg cursor-ew-resize opacity-70 hover:opacity-100 hover:bg-blue-400 transition-all duration-200 shadow-lg border-2 border-white"
            title="Drag to resize width from left"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              const startX = e.clientX;
              const startWidth = canvasSize.width;

              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = startX - e.clientX; // Reversed for left side
                const newWidth = Math.max(
                  400,
                  Math.min(2000, startWidth + deltaX)
                );
                setCanvasSize((prev) => ({ ...prev, width: newWidth }));
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                setTimeout(() => {
                  saveState();
                  setIsResizing(false);
                }, 100);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />

          {/* Top edge handle */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-5 bg-blue-500 rounded-lg cursor-ns-resize opacity-70 hover:opacity-100 hover:bg-blue-400 transition-all duration-200 shadow-lg border-2 border-white"
            title="Drag to resize height from top"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              const startY = e.clientY;
              const startHeight = canvasSize.height;

              const handleMouseMove = (e: MouseEvent) => {
                const deltaY = startY - e.clientY; // Reversed for top side
                const newHeight = Math.max(
                  300,
                  Math.min(1500, startHeight + deltaY)
                );
                setCanvasSize((prev) => ({ ...prev, height: newHeight }));
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                setTimeout(() => {
                  saveState();
                  setIsResizing(false);
                }, 100);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />

          {/* Bottom edge handle */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-5 bg-blue-500 rounded-lg cursor-ns-resize opacity-70 hover:opacity-100 hover:bg-blue-400 transition-all duration-200 shadow-lg border-2 border-white"
            title="Drag to resize height"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              const startY = e.clientY;
              const startHeight = canvasSize.height;

              const handleMouseMove = (e: MouseEvent) => {
                const deltaY = e.clientY - startY;
                const newHeight = Math.max(
                  300,
                  Math.min(1500, startHeight + deltaY)
                ); // Add max constraint
                setCanvasSize((prev) => ({ ...prev, height: newHeight }));
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                // Save state after resize is complete
                setTimeout(() => {
                  saveState();
                  setIsResizing(false);
                }, 100);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />

          {/* Corner resize handles */}
          {/* Top-left corner */}
          <div
            className="absolute -top-2 -left-2 w-5 h-5 bg-blue-500 rounded-lg cursor-nw-resize opacity-70 hover:opacity-100 hover:bg-blue-400 transition-all duration-200 shadow-lg border-2 border-white"
            title="Drag to resize both width and height from top-left"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = canvasSize.width;
              const startHeight = canvasSize.height;

              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = startX - e.clientX; // Reversed for left
                const deltaY = startY - e.clientY; // Reversed for top
                const newWidth = Math.max(
                  400,
                  Math.min(2000, startWidth + deltaX)
                );
                const newHeight = Math.max(
                  300,
                  Math.min(1500, startHeight + deltaY)
                );
                setCanvasSize({ width: newWidth, height: newHeight });
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                setTimeout(() => {
                  saveState();
                  setIsResizing(false);
                }, 100);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />

          {/* Top-right corner */}
          <div
            className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-lg cursor-ne-resize opacity-70 hover:opacity-100 hover:bg-blue-400 transition-all duration-200 shadow-lg border-2 border-white"
            title="Drag to resize both width and height from top-right"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = canvasSize.width;
              const startHeight = canvasSize.height;

              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX; 
                const deltaY = startY - e.clientY; 
                const newWidth = Math.max(
                  400,
                  Math.min(2000, startWidth + deltaX)
                );
                const newHeight = Math.max(
                  300,
                  Math.min(1500, startHeight + deltaY)
                );
                setCanvasSize({ width: newWidth, height: newHeight });
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                setTimeout(() => {
                  saveState();
                  setIsResizing(false);
                }, 100);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />

          {/* Bottom-left corner */}
          <div
            className="absolute -bottom-2 -left-2 w-5 h-5 bg-blue-500 rounded-lg cursor-sw-resize opacity-70 hover:opacity-100 hover:bg-blue-400 transition-all duration-200 shadow-lg border-2 border-white"
            title="Drag to resize both width and height from bottom-left"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = canvasSize.width;
              const startHeight = canvasSize.height;

              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = startX - e.clientX; 
                const deltaY = e.clientY - startY; 
                const newWidth = Math.max(
                  400,
                  Math.min(2000, startWidth + deltaX)
                );
                const newHeight = Math.max(
                  300,
                  Math.min(1500, startHeight + deltaY)
                );
                setCanvasSize({ width: newWidth, height: newHeight });
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                setTimeout(() => {
                  saveState();
                  setIsResizing(false);
                }, 100);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />

          {/* Bottom-right corner */}
          <div
            className="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 rounded-lg cursor-se-resize opacity-70 hover:opacity-100 hover:bg-blue-400 transition-all duration-200 shadow-lg border-2 border-white"
            title="Drag to resize both width and height from bottom-right"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = canvasSize.width;
              const startHeight = canvasSize.height;

              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                const newWidth = Math.max(
                  400,
                  Math.min(2000, startWidth + deltaX)
                );
                const newHeight = Math.max(
                  300,
                  Math.min(1500, startHeight + deltaY)
                );
                setCanvasSize({ width: newWidth, height: newHeight });
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                setTimeout(() => {
                  saveState();
                  setIsResizing(false);
                }, 100);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />
        </div>
      </div>

      {/* Preview Canvas for Shapes */}
      <canvas
        ref={previewCanvasRef}
        className="absolute inset-0 z-20 pointer-events-none"
      />
    </div>
  );
}

export default App;
