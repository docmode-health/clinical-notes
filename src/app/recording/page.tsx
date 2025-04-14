'use client';

import { Box, Typography, IconButton, CircularProgress, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { useRouter } from 'next/navigation';
import { useVoiceRecorderContext } from '@/contexts/VoiceRecorderContext';
import { useNotesContext } from '@/contexts/NotesContext';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { generateMedicalSummary } from '@/lib/openai';
import dynamic from 'next/dynamic';

// Dynamically import Navigation to avoid hydration issues
const DynamicNavigation = dynamic(() => import('@/components/Navigation'), {
  ssr: false,
});

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function Recording() {
  const router = useRouter();
  const { isRecording, isPaused, recordingTime, transcription, stopRecording, pauseRecording, resumeRecording, startRecording, error } = useVoiceRecorderContext();
  const { addNote } = useNotesContext();
  const [isStopping, setIsStopping] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Start recording when the component mounts
  useEffect(() => {
    if (!mounted) return;
    
    const start = async () => {
      try {
        setIsStarting(true);
        await startRecording();
        setIsStarting(false);
      } catch (error) {
        console.error('Failed to start recording:', error);
        router.push('/');
      }
    };
    start();
  }, [startRecording, router, mounted]);

  // Only redirect to notes page when explicitly stopping
  useEffect(() => {
    if (!mounted) return;
    
    if (!isRecording && isStopping && !isStarting) {
      router.push('/notes');
    }
  }, [isRecording, isStopping, isStarting, router, mounted]);

  const handleBack = async () => {
    try {
      if (isRecording || isStarting) {
        await stopRecording();
      }
      router.push('/');
    } catch (error) {
      console.error('Error stopping recording:', error);
      router.push('/');
    }
  };

  const handleStop = async () => {
    try {
      setIsStopping(true);
      const { transcription } = await stopRecording();
      console.log('Raw transcription:', transcription);
      
      const { summary, patientHistory } = await generateMedicalSummary(transcription);
      console.log('Generated summary:', summary);
      console.log('Generated patient history:', patientHistory);
      
      // Create a new note
      addNote({
        patientName: 'New Patient', // Default name, in a real app this would come from a form
        date: new Date(),
        duration: formatTime(recordingTime),
        condition: summary.split('.')[0], // Use the first sentence of the summary as the condition
        summary,
        patientHistory,
      });
    } catch (error) {
      console.error('Error stopping recording:', error);
      router.push('/');
    }
  };

  if (!mounted) {
    return null;
  }

  if (isStarting) {
    return (
      <main>
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2, px: 3 }}>
          <IconButton color="inherit" sx={{ ml: -1 }} onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            height: 'calc(100vh - 144px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Starting recording...
          </Typography>
        </Box>
        <DynamicNavigation />
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2, px: 3 }}>
          <IconButton color="inherit" sx={{ ml: -1 }} onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            height: 'calc(100vh - 144px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
          }}
        >
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Error
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={handleBack}>
            Go Back
          </Button>
        </Box>
        <DynamicNavigation />
      </main>
    );
  }

  return (
    <main>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2, px: 3 }}>
        <IconButton color="inherit" sx={{ ml: -1 }} onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          height: 'calc(100vh - 144px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 4 }}>Listening</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 6, textAlign: 'center' }}>
          Keep this screen open when discussing with your patient.
        </Typography>

        <Box sx={{ position: 'relative', width: 200, height: 200, mb: 4 }}>
          {/* Animated circles */}
          {[...Array(3)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'primary.main',
                animation: !isPaused ? 'ripple 2s infinite' : 'none',
                animationDelay: `${i * 0.5}s`,
                opacity: isPaused ? 0.3 : 0,
                '@keyframes ripple': {
                  '0%': {
                    transform: 'translate(-50%, -50%) scale(0.5)',
                    opacity: 0.3,
                  },
                  '100%': {
                    transform: 'translate(-50%, -50%) scale(1.2)',
                    opacity: 0,
                  },
                },
              }}
            />
          ))}

          {/* Microphone icon in center */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box component="img" src="/microphone-icon.svg" sx={{ width: 32, height: 32, filter: 'brightness(0) invert(1)' }} />
          </Box>
        </Box>

        <Typography variant="h4" sx={{ fontFamily: 'monospace', mb: 4 }}>
          {formatTime(recordingTime)}
        </Typography>

        {/* Control buttons */}
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Box
            onClick={handleStop}
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'error.dark' },
            }}
          >
            <StopIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box
            onClick={isPaused ? resumeRecording : pauseRecording}
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            {isPaused ? (
              <PlayArrowIcon sx={{ color: 'white', fontSize: 36 }} />
            ) : (
              <PauseIcon sx={{ color: 'white', fontSize: 36 }} />
            )}
          </Box>
        </Box>
      </Box>

      <DynamicNavigation />
    </main>
  );
} 