import React from 'react';
import { Mic, MicOff, Play, Pause, Trash2, Clock, Volume2, AlertCircle } from 'lucide-react';
import { VoiceNote } from '../types';

interface VoiceNotesPanelProps {
  voiceNotes: VoiceNote[];
  isRecording: boolean;
  recordingTime: number;
  hasPermission: boolean | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDeleteNote: (id: string) => void;
  formatTime: (seconds: number) => string;
  isVisible: boolean;
}

export const VoiceNotesPanel: React.FC<VoiceNotesPanelProps> = ({
  voiceNotes,
  isRecording,
  recordingTime,
  hasPermission,
  onStartRecording,
  onStopRecording,
  onDeleteNote,
  formatTime,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-right-2 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Voice Notes
        </h3>
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={hasPermission === false}
          className={`relative p-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
              : 'bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-5 h-5 text-white" />
              <div className="absolute inset-0 bg-red-400/30 rounded-xl animate-pulse" />
            </>
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Permission Warning */}
      {hasPermission === false && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl">
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Microphone access denied</span>
          </div>
          <p className="text-xs text-red-200 mt-1">
            Please allow microphone access in your browser settings
          </p>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping" />
              </div>
              <span className="text-white font-medium">Recording</span>
            </div>
            <div className="flex items-center gap-2 text-red-300">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
            </div>
          </div>
          <div className="mt-3 h-1 bg-red-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Voice Notes List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {voiceNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <Mic className="w-8 h-8 text-white/50" />
            </div>
            <p className="text-white/70 mb-2">No voice notes yet</p>
            <p className="text-sm text-white/50">
              Tap the microphone to start recording
            </p>
          </div>
        ) : (
          voiceNotes.map((note) => (
            <VoiceNoteItem
              key={note.id}
              note={note}
              onDelete={onDeleteNote}
              formatTime={formatTime}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface VoiceNoteItemProps {
  note: VoiceNote;
  onDelete: (id: string) => void;
  formatTime: (seconds: number) => string;
}

const VoiceNoteItem: React.FC<VoiceNoteItemProps> = ({ note, onDelete, formatTime }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = parseFloat(e.target.value);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="group p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-white text-sm">{note.title}</span>
        <button
          onClick={() => onDelete(note.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 transition-all duration-300"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
      
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={togglePlayback}
          className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors transform hover:scale-105"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white" />
          )}
        </button>
        
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={note.duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer audio-slider"
          />
        </div>
        
        <div className="flex items-center gap-1 text-xs text-white/70 font-mono">
          <Clock className="w-3 h-3" />
          <span>{formatTime(Math.floor(currentTime))}</span>
          <span>/</span>
          <span>{formatTime(note.duration)}</span>
        </div>
      </div>

      <div className="text-xs text-white/50">
        {new Date(note.timestamp).toLocaleString()}
      </div>
      
      <audio
        ref={audioRef}
        src={note.url}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setCurrentTime(0);
          }
        }}
      />

      <style jsx>{`
        .audio-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .audio-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};