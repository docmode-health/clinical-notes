'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  transcription: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ audio: Blob; transcription: string }>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  error: string | null;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [transcription, setTranscription] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [recognitionTimeout, setRecognitionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const checkBrowserSupport = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Audio recording is not supported in this browser');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech recognition is not supported in this browser');
    }
  }, []);

  const startRecording = async () => {
    if (isRecording) return;

    try {
      // First check if we have any audio input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      
      if (audioInputs.length === 0) {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      }

      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log('Microphone access granted');
      
      setIsRecording(true);
      setError(null);
      setRecordingTime(0);
      setTranscription('');

      // Start the timer
      const intervalId = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setTimer(intervalId);

      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioChunks(audioChunks);
        stream.getTracks().forEach(track => track.stop());
        // Clear the timer when recording stops
        if (timer) {
          clearInterval(timer);
          setTimer(null);
        }
      };

      mediaRecorder.start();
      setMediaRecorder(mediaRecorder);

      // Start transcription
      if ('webkitSpeechRecognition' in window) {
        console.log('Initializing speech recognition...');
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        let recognitionAttempts = 0;
        const maxRecognitionAttempts = 3;
        let isRecognitionActive = false;

        const startRecognition = () => {
          if (isRecognitionActive) {
            console.log('Recognition already active, skipping start');
            return;
          }
          
          try {
            console.log('Starting speech recognition...');
            recognition.start();
            isRecognitionActive = true;
            recognitionAttempts = 0;
            console.log('Speech recognition started successfully');
          } catch (err) {
            console.error('Failed to start recognition:', err);
            isRecognitionActive = false;
            recognitionAttempts++;
            if (recognitionAttempts < maxRecognitionAttempts) {
              console.log(`Retrying recognition (attempt ${recognitionAttempts + 1}/${maxRecognitionAttempts})...`);
              const timeout = setTimeout(startRecognition, 3000);
              setRecognitionTimeout(timeout);
            } else {
              console.error('Max recognition attempts reached');
              setError('Failed to start speech recognition after multiple attempts. Please refresh the page and try again.');
            }
          }
        };

        recognition.onstart = () => {
          console.log('Speech recognition service started');
          isRecognitionActive = true;
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          console.log('New transcription:', transcript);
          setTranscription(transcript);
        };

        recognition.onend = () => {
          console.log('Speech recognition service ended');
          isRecognitionActive = false;
          if (isRecording && !isPaused) {
            // Only restart if we haven't exceeded max attempts and recording is still active
            if (recognitionAttempts < maxRecognitionAttempts && mediaRecorder?.state === 'recording') {
              console.log('Recognition ended while recording is active, restarting...');
              const timeout = setTimeout(startRecognition, 3000);
              setRecognitionTimeout(timeout);
            } else {
              console.log('Max recognition attempts reached or recording stopped, not restarting');
              if (recognitionAttempts >= maxRecognitionAttempts) {
                setError('Speech recognition was interrupted multiple times. Please refresh the page and try again.');
              }
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          isRecognitionActive = false;
          
          if (event.error === 'aborted') {
            console.log('Recognition aborted, checking retry conditions...');
            if (recognitionAttempts < maxRecognitionAttempts && mediaRecorder?.state === 'recording') {
              console.log(`Retrying recognition (attempt ${recognitionAttempts + 1}/${maxRecognitionAttempts})...`);
              const timeout = setTimeout(startRecognition, 3000);
              setRecognitionTimeout(timeout);
            } else {
              console.log('Max retry attempts reached or recording stopped, not restarting');
              if (recognitionAttempts >= maxRecognitionAttempts) {
                setError('Speech recognition was interrupted multiple times. Please refresh the page and try again.');
              }
            }
          } else if (event.error === 'no-speech') {
            console.log('No speech detected - this is normal');
          } else if (event.error === 'audio-capture') {
            console.error('Microphone capture error');
            setError('Microphone is not accessible. Please check your microphone settings and try again.');
          } else {
            console.error('Unknown speech recognition error:', event.error);
            setError(`Speech recognition error: ${event.error}`);
          }
        };

        console.log('Starting initial speech recognition...');
        startRecognition();
        setRecognitionInstance(recognition);
      } else {
        console.error('Speech recognition not supported in this browser');
        setError('Speech recognition is not supported in this browser');
      }
    } catch (err) {
      console.error('Recording error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (err.name === 'NotReadableError') {
          setError('Microphone is busy or not accessible. Please check if another application is using it.');
        } else {
          setError(`Failed to start recording: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred while starting the recording');
      }
      // Clear the timer if there's an error
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      throw err;
    }
  };

  const pauseRecording = useCallback(() => {
    try {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        recognitionRef.current?.stop();
        setIsPaused(true);
        // Pause the timer
        if (timer) {
          clearInterval(timer);
          setTimer(null);
        }
      }
    } catch (err) {
      setError('Failed to pause recording: ' + (err as Error).message);
      console.error('Pause error:', err);
    }
  }, [mediaRecorder, timer]);

  const resumeRecording = useCallback(() => {
    try {
      if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        recognitionRef.current?.start();
        setIsPaused(false);
        // Resume the timer
        const intervalId = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
        setTimer(intervalId);
      }
    } catch (err) {
      setError('Failed to resume recording: ' + (err as Error).message);
      console.error('Resume error:', err);
    }
  }, [mediaRecorder]);

  const stopRecording = useCallback(async () => {
    return new Promise<{ audio: Blob; transcription: string }>((resolve, reject) => {
      try {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
          // If there's no active recording, return empty audio and transcription
          console.log('No active recording found, returning empty result');
          resolve({ 
            audio: new Blob([], { type: 'audio/wav' }), 
            transcription: transcription || '' 
          });
          return;
        }

        const audioChunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          resolve({ audio: audioBlob, transcription });
        };
        
        mediaRecorder.onerror = (event) => {
          reject(new Error('MediaRecorder error: ' + event.error));
        };
        
        // Stop recognition first
        if (recognitionInstance) {
          console.log('Stopping speech recognition...');
          recognitionInstance.stop();
          setRecognitionInstance(null);
        }
        
        // Clear any pending timeouts
        if (recognitionTimeout) {
          clearTimeout(recognitionTimeout);
          setRecognitionTimeout(null);
        }
        
        // Stop the media recorder
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
        setIsPaused(false);
        
        if (timer) {
          clearInterval(timer);
          setTimer(null);
        }
        setRecordingTime(0);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError('Failed to stop recording: ' + errorMessage);
        console.error('Stop recording error:', err);
        reject(err);
      }
    });
  }, [mediaRecorder, timer, transcription, recognitionInstance, recognitionTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up voice recorder...');
      if (recognitionTimeout) {
        clearTimeout(recognitionTimeout);
        setRecognitionTimeout(null);
      }
      if (recognitionInstance) {
        recognitionInstance.stop();
        setRecognitionInstance(null);
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
    };
  }, [recognitionTimeout, recognitionInstance, mediaRecorder, timer]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    transcription,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error
  };
} 