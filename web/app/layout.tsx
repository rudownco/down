import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'r u down?',
  description: 'Stop fumbling in group chats. See who\'s actually down.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  );
}
