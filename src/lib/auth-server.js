import { cookies } from 'next/headers';

export async function getServerUser() {
  const cookieStore = cookies();
  const userCookie = cookieStore.get('rag_user');
  const tokenCookie = cookieStore.get('rag_token');
  if (!userCookie || !tokenCookie) return null;
  try {
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}

export function getServerToken() {
  const cookieStore = cookies();
  return cookieStore.get('rag_token')?.value ?? null;
}
