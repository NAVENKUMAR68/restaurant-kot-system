import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;
        const role = token?.role;

        // Protect Admin Routes
        if (path.startsWith('/dashboard/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard/' + role, req.url));
        }

        // Protect Kitchen Routes
        if (path.startsWith('/dashboard/kitchen') && role !== 'kitchen' && role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard/' + role, req.url));
        }

        // Protect Customer Routes
        // (Optional: Maybe admin/kitchen can view customer dashboard? Usually not needed but allow for now)
        // If strict:
        // if (path.startsWith('/dashboard/customer') && role !== 'customer') { ... }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ['/dashboard/:path*'],
};
