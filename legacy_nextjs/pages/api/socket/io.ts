import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/next';
import { initSocket } from '@/lib/socket-server';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIO
) {
    if (!res.socket.server.io) {
        const io = initSocket(res.socket.server);
        res.socket.server.io = io;
    }
    res.end();
}
