import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Force dynamic to avoid static generation issues with auth
export const dynamic = 'force-dynamic';
