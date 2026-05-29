import { NextResponse } from 'next/server';

const PUBLIC = ['/login', '/register'];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token  = req.cookies.get('rag_token')?.value;
  const isPublic = PUBLIC.some(p => pathname.startsWith(p));

  if (!token && !isPublic) return NextResponse.redirect(new URL('/login', req.url));
  if ( token &&  isPublic) return NextResponse.redirect(new URL('/chat',  req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
