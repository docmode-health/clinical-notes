'use client';

import { ReactNode } from 'react';
import ThemeRegistry from '@/components/ThemeRegistry';
import { VoiceRecorderProvider } from '@/contexts/VoiceRecorderContext';
import { NotesProvider } from '@/contexts/NotesContext';

export default function RootLayoutClient({
  children,
  fontFamily,
}: {
  children: ReactNode;
  fontFamily: string;
}) {
  return (
    <ThemeRegistry fontFamily={fontFamily}>
      <NotesProvider>
        <VoiceRecorderProvider>
          {children}
        </VoiceRecorderProvider>
      </NotesProvider>
    </ThemeRegistry>
  );
} 