import { createAdapter } from '@socket.io/redis-adapter';
import express from 'express';
import http from 'http';
import { createClient } from 'redis';
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);

const io = new Server(server)

const PORT = process.env.PORT || 3002;

// redis pub/sub clients
const pubClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
const subClient = createClient();

Promise.all([pubClient.connect(),subClient.connect()]).then(() => {
    console.log('Redis pub sub connected');
}).then(() => {
    io.adapter(createAdapter(pubClient,subClient));
    server.listen(PORT, () => {
        console.log(`listening on => ${PORT}`);
    });
}).catch((err) => {
    console.error('Error occured :>>', err);
});

subClient.subscribe('userAddedRedis',(message) => {
    console.log(`message: `,JSON.parse(message));
}).then(() => {
    console.log('userAddedRedis subscribed');
}).catch(err => {
    console.log('err :>> ', err);
});


io.on('connection', async (socket) => {
    console.log(`user connected socket: ${socket.id}`)

    socket.on('addNew', async (data) => {
        await pubClient.publish('userAddedRedis', JSON.stringify({...data, socket: socket.id}));
        console.log('addNew :>> ', data);
        socket.broadcast.emit('newAdded',data);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected ${socket.id}`);
    });
});


app.get('/api', (req:express.Request, res:express.Response) => {
    res.send({data:'req from server2'})
});
