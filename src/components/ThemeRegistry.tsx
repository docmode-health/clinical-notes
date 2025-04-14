'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

interface ThemeRegistryProps {
  children: React.ReactNode;
  fontFamily: string;
}

export default function ThemeRegistry({ children, fontFamily }: ThemeRegistryProps) {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#663399', // Purple color from the design
      },
      background: {
        default: '#FFFFFF',
      },
    },
    typography: {
      fontFamily,
    },
  });

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
} 