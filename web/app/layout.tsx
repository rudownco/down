import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'r u down?',
  description: 'Stop fumbling in group chats. See who\'s actually down.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
