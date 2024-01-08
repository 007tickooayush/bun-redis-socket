import { createAdapter } from '@socket.io/redis-adapter';
import express from 'express';
import http from 'http';
import { createClient } from 'redis';
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);

const io = new Server(server)

const PORT = process.env.PORT || 3003;

// redis pub/sub clients
const pubClient = createClient({
    url: 'redis://localhost:6379'
});
const subClient = createClient();

Promise.all([pubClient.connect(),subClient.connect()]).then(() => {
    console.log('Redis pub sub connected');
}).then(() => {
    // io.adapter(createAdapter(pubClient,subClient)).listen(PORT);

    io.adapter(createAdapter(pubClient,subClient));
    server.listen(PORT, () => {
        console.log(`listening on *:${PORT}`);
    });
}).catch((err) => {
    console.error('Error occured :>>', err);
});

app.get('/api', (req:express.Request, res:express.Response) => {
    res.send({data:'req from server2'})
//   res.send('<h1>Hello world</h1>');
});