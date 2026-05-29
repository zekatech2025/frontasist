import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth-server';
import Shell from '@/components/Shell';

export default async function DashboardLayout({ children }) {
  const user = await getServerUser();
  if (!user) redirect('/login');
  return <Shell user={user}>{children}</Shell>;
}
