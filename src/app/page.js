import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth-server';

export default async function Home() {
  const user = await getServerUser();
  redirect(user ? '/chat' : '/login');
}
