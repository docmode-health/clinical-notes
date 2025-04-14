'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

export interface Note {
  id: string;
  patientName: string;
  date: Date;
  duration: string;
  condition: string;
  summary: string;
  patientHistory: string[];
  isRead: boolean;
}

interface NotesContextType {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  getNote: (id: string) => Note | undefined;
}

const NotesContext = createContext<NotesContextType | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);

  const addNote = (note: Omit<Note, 'id' | 'isRead'>) => {
    const newNote = {
      ...note,
      id: Date.now().toString(),
      isRead: false,
      patientHistory: Array.isArray(note.patientHistory) ? note.patientHistory : [],
    };
    console.log('Adding new note:', newNote);
    setNotes(prev => [newNote, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id ? { ...note, isRead: true } : note
      )
    );
  };

  const getNote = (id: string) => {
    return notes.find(note => note.id === id);
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, markAsRead, getNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotesContext() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
} 