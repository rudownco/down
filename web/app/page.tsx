import { redirect } from 'next/navigation';

// Root — redirect to dashboard (auth guard will handle unauthenticated users)
export default function RootPage() {
  redirect('/dashboard');
}
