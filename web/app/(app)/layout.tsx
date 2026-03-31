'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Home, Users, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [session, isLoading, router, pathname]);

  // Show nothing while checking auth — avoids flash of protected content
  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
