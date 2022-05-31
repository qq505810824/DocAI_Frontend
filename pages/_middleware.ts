import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';

export function middleware(req: NextRequest) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
        const auth = basicAuth.split(' ')[1];
        const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');

        if (user === process.env.NEXT_USER && pwd === process.env.NEXT_PASSWORD) {
            return NextResponse.next();
        }
    }

    return new Response('Auth required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"'
        }
    });
}
