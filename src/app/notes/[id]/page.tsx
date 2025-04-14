'use client';

import { Box, Button, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useRouter } from 'next/navigation';
import { useNotesContext } from '@/contexts/NotesContext';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';

export default function NoteDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getNote, markAsRead } = useNotesContext();
  const note = getNote(params.id);
  
  useEffect(() => {
    if (note && !note.isRead) {
      markAsRead(note.id);
    }
  }, [note, markAsRead]);

  if (!note) {
    return null;
  }

  // Ensure patientHistory is an array
  const patientHistory = Array.isArray(note.patientHistory) ? note.patientHistory : [];

  return (
    <main>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton 
          color="inherit" 
          sx={{ ml: -1 }} 
          onClick={() => {
            router.replace('/notes');
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1">{note.patientName}</Typography>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<AutorenewIcon />}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            }}
          >
            Enhance
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>SUMMARY</Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          {note.summary}
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>PATIENT HISTORY</Typography>
        
        <Box component="ul" sx={{ pl: 2, mb: 3 }}>
          {patientHistory.map((item, index) => (
            <Typography key={index} component="li" variant="body1" sx={{ mb: index < patientHistory.length - 1 ? 1 : 0 }}>
              {item}
            </Typography>
          ))}
        </Box>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => {
            navigator.clipboard.writeText(`${note.summary}\n\nPatient History:\n${patientHistory.join('\n')}`);
          }}
          sx={{ borderRadius: 2, py: 1.5, mb: 8 }}
        >
          Copy
        </Button>
      </Box>

      <Navigation />
    </main>
  );
} 