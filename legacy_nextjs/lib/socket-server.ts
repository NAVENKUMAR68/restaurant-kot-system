import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';

export const config = {
    api: {
        bodyParser: false,
    },
};

export const initSocket = (server: NetServer) => {
    if (!(global as any).io) {
        console.log('Initializing Socket.IO...');
        const io = new SocketIOServer(server, {
            path: '/api/socket/io',
            addTrailingSlash: false,
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
        (global as any).io = io;
    }
    return (global as any).io;
};
