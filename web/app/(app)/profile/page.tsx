import { AvatarCircle } from '@down/common';
import { Button } from '@/components/ui/button';
import { currentUser } from '@down/common';

export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <AvatarCircle user={currentUser} size="xl" />
      <div className="text-center">
        <h1 className="text-2xl font-heading font-bold text-on-surface">{currentUser.name}</h1>
        <p className="text-sm text-outline mt-1">@{currentUser.name.toLowerCase().replace(' ', '')}</p>
      </div>

      <Button variant="outline" size="lg" className="w-full max-w-xs">
        Sign Out
      </Button>
    </div>
  );
}
