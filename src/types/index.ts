export interface Point {
  x: number;
  y: number;
}

export interface VoiceNote {
  id: string;
  url: string;
  duration: number;
  timestamp: number;
  title: string;
}

export type DrawingTool = 'pen' | 'eraser' | 'highlighter' | 'shapes';
export type PenType = 'normal' | 'marker' | 'highlighter';
export type ShapeType = 'rectangle' | 'circle' | 'triangle';