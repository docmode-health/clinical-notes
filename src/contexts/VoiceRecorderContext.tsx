'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

interface VoiceRecorderContextType {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  transcription: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ transcription: string }>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  error: string | null;
}

const VoiceRecorderContext = createContext<VoiceRecorderContextType | null>(null);

export function VoiceRecorderProvider({ children }: { children: ReactNode }) {
  const voiceRecorder = useVoiceRecorder();

  const stopRecording = async () => {
    const { transcription } = await voiceRecorder.stopRecording();
    return { transcription };
  };

  return (
    <VoiceRecorderContext.Provider value={{
      ...voiceRecorder,
      stopRecording,
    }}>
      {children}
    </VoiceRecorderContext.Provider>
  );
}

export function useVoiceRecorderContext() {
  const context = useContext(VoiceRecorderContext);
  if (!context) {
    throw new Error('useVoiceRecorderContext must be used within a VoiceRecorderProvider');
  }
  return context;
} 