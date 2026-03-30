import Link from 'next/link';
import { Home, Users, User } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur border-b border-outline-variant/20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard">
            <span className="font-heading font-black text-xl text-primary tracking-tight">
              r u down?
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
              <Home size={20} />
            </Link>
            <Link href="/groups" className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
              <Users size={20} />
            </Link>
            <Link href="/profile" className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
              <User size={20} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
