'use client';

import { Box, Button, Typography, Container, Alert } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useVoiceRecorderContext } from '@/contexts/VoiceRecorderContext';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Navigation to avoid hydration issues
const DynamicNavigation = dynamic(() => import('@/components/Navigation'), {
  ssr: false,
});

export default function Home() {
  const router = useRouter();
  const { startRecording, error: recorderError } = useVoiceRecorderContext();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartRecording = async () => {
    console.log('Starting recording...');
    try {
      console.log('Calling startRecording...');
      await startRecording();
      console.log('Recording started, navigating to recording page...');
      router.push('/recording');
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <main>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2, px: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" sx={{ minWidth: 'auto', p: 1 }}>
            <Box component="span" sx={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid white' }} />
          </Button>
          <Button color="inherit" sx={{ minWidth: 'auto', p: 1 }}>
            <Box component="span" sx={{ width: 20, height: 20, border: '2px solid white' }} />
          </Button>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(error || recorderError) && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error || recorderError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              1
            </Box>
            <Box>
              <Typography variant="h6">Start Recording</Typography>
              <Typography variant="body2" color="text.secondary">
                Tap the record button to begin capturing your consultation instantly.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: '#E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              2
            </Box>
            <Box>
              <Typography variant="h6">Speak to Patient</Typography>
              <Typography variant="body2" color="text.secondary">
                Talk to your patient as usual—our AI listens and transcribes.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: '#E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              3
            </Box>
            <Box>
              <Typography variant="h6">View Notes</Typography>
              <Typography variant="body2" color="text.secondary">
                In seconds, see a structured transcription ready for review.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<MicIcon />}
              sx={{ flex: 1, borderRadius: 2, py: 1.5 }}
              onClick={handleStartRecording}
            >
              Record
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ flex: 1, borderRadius: 2, py: 1.5 }}
            >
              Upload
            </Button>
          </Box>

          <Box
            sx={{
              width: '100%',
              height: 200,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundImage: `url(/images/consultation-image.jpg?t=${Date.now()})`,
              borderRadius: 2,
              mb: 3,
            }}
          />
        </Box>
      </Container>

      <DynamicNavigation />
    </main>
  );
} 