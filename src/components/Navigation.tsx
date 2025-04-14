'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import HomeIcon from '@mui/icons-material/Home';
import NotesIcon from '@mui/icons-material/Notes';
import PersonIcon from '@mui/icons-material/Person';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Set initial value based on pathname
    if (pathname.includes('/notes')) {
      setValue(1);
    } else if (pathname.includes('/profile')) {
      setValue(2);
    } else {
      setValue(0);
    }
  }, [pathname]);

  if (!mounted) {
    return null;
  }

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          switch (newValue) {
            case 0:
              router.push('/');
              break;
            case 1:
              router.push('/notes');
              break;
            case 2:
              router.push('/profile');
              break;
          }
        }}
        sx={{
          bgcolor: 'background.paper',
          '& .Mui-selected': {
            color: 'primary.main',
          },
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Notes" icon={<NotesIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
} 