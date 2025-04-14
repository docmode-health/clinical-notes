import React, { useState } from 'react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card } from './ui/card';
import { Mic, MicOff, Pause, Play, Square, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (data: { audio: Blob; transcription: string }) => void;
  className?: string;
}

export function VoiceRecorder({ onRecordingComplete, className = '' }: VoiceRecorderProps) {
  const {
    isRecording,
    isPaused,
    recordingTime,
    transcription,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error
  } = useVoiceRecorder();

  const [isProcessing, setIsProcessing] = useState(false);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsProcessing(true);
      const result = await stopRecording();
      onRecordingComplete(result);
    } catch (err) {
      console.error('Failed to stop recording:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isRecording ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium">Recording {formatTime(recordingTime)}</span>
              </div>
            ) : (
              <span className="text-sm font-medium">Ready to record</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isRecording && !isProcessing && (
              <Button
                variant="default"
                size="icon"
                onClick={handleStartRecording}
                disabled={isProcessing}
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}

            {isRecording && (
              <>
                {isPaused ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resumeRecording}
                    disabled={isProcessing}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={pauseRecording}
                    disabled={isProcessing}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleStopRecording}
                  disabled={isProcessing}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {transcription && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Transcription:</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {transcription}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 