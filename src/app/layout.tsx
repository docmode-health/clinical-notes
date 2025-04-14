import { Inter } from 'next/font/google';
import RootLayoutClient from '@/components/RootLayoutClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Clinical Notes',
  description: 'AI-powered clinical notes application',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <RootLayoutClient fontFamily={inter.style.fontFamily}>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
} 