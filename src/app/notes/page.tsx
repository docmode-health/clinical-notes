'use client';

import { Box, Button, Typography, TextField, Tabs, Tab, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import { format } from 'date-fns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MailIcon from '@mui/icons-material/Mail';
import Navigation from '@/components/Navigation';
import { useNotesContext } from '@/contexts/NotesContext';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Notes() {
  const router = useRouter();
  const { notes } = useNotesContext();

  return (
    <main>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton 
          color="inherit" 
          sx={{ ml: -1 }} 
          onClick={() => router.push('/')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" sx={{ minWidth: 'auto', p: 1 }}>
            <Box component="span" sx={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid white' }} />
          </Button>
          <Button color="inherit" sx={{ minWidth: 'auto', p: 1 }}>
            <Box component="span" sx={{ width: 20, height: 20, border: '2px solid white' }} />
          </Button>
        </Box>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        <TextField
          fullWidth
          placeholder="Search recordings"
          variant="outlined"
          size="small"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'background.paper',
            },
          }}
        />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={0} aria-label="note filters">
            <Tab label="All" />
            <Tab label="Unread" />
            <Tab label="Trash" />
          </Tabs>
        </Box>

        <List sx={{ mb: 8 }}>
          {notes.map((note) => (
            <ListItem
              key={note.id}
              sx={{
                bgcolor: 'background.paper',
                mb: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
              button
              onClick={() => router.push(`/notes/${note.id}`)}
            >
              <ListItemText
                primaryTypographyProps={{ component: 'div' }}
                primary={
                  <>
                    <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>
                      {note.patientName}
                    </Typography>
                    <Typography variant="body2" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                      {format(new Date(note.date), 'MMM d, yyyy')}
                    </Typography>
                  </>
                }
                secondaryTypographyProps={{ component: 'div' }}
                secondary={
                  <>
                    <Typography variant="body2" component="span" color="text.secondary">
                      Duration: {note.duration}
                    </Typography>
                    <Typography variant="body2" component="span" color="text.secondary">
                      Condition: {note.condition}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                {note.isRead ? (
                  <CheckCircleIcon color="primary" />
                ) : (
                  <MailIcon color="action" />
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>

      <Navigation />
    </main>
  );
} 