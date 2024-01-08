import { createAdapter } from '@socket.io/redis-adapter';
import express from 'express';
import http from 'http';
import { createClient } from 'redis';
// import {Redis} from 'ioredis';
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);

const io = new Server(server)

const PORT = process.env.PORT || 3009;

// redis pub/sub clients
const pubClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
const subClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

Promise.all([pubClient.connect(),subClient.connect()]).then(() => {
    console.log('Redis pub sub connected');
}).then(() => {

    io.adapter(createAdapter(pubClient,subClient));
    server.listen(PORT, () => {
        console.log(`listening on => ${PORT}`);
    });
}).catch((err) => {
    console.log('process.env.REDIS_URL  :>> ', process.env.REDIS_URL );
    console.error('Error occured :>>', err);
});

subClient.subscribe('userAddedRedis',(message) => {
    console.log(`message: `,JSON.parse(message));
    const data = JSON.parse(message);
    if(data.socket){
        if(data.id){
            pubClient.set(`id:${data.id}`,`${data.socket}`).then(() => {
                console.log(`SAVED: ${data.socket} added to set`)
            }).catch(err => {
                console.error(`ERROR: ${data.socket} not added to set`)
            })
        }else{
            console.error('data.id attribute not found');
        }
    }else{
        console.error('data.socket attribute not found');
    }
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

    socket.on('getUser', async (data) => {
        const usersocket = await pubClient.get(`id:${data.id}`);
        socket.emit('sentUser',{socket: usersocket});
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected ${socket.id}`);
    });
});


app.get('/api', (req:express.Request, res:express.Response) => {
    res.send({data:'req from server1'})
});
