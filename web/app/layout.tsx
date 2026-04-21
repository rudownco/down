import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';

// Inline script runs before paint to avoid flash of wrong theme
const themeScript = `
try {
  var m = localStorage.getItem('theme-mode');
  var sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (m === 'dark' || (m === 'system' && sys) || (!m && sys)) {
    document.documentElement.classList.add('dark');
  }
} catch(e) {}
`;

export const metadata: Metadata = {
  title: 'r u down?',
  description: "Stop fumbling in group chats. See who's actually down.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
