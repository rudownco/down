import { InviteAccept } from '../../../components/InviteAccept';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  return <InviteAccept token={token} />;
}
