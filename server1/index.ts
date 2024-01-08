import { createAdapter } from '@socket.io/redis-adapter';
import express from 'express';
import http from 'http';
import { createClient } from 'redis';
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);

const io = new Server(server)

const PORT = process.env.PORT || 3002;


app.get('/api', (req:express.Request, res:express.Response) => {
    res.send({data:'req from server2'})
//   res.send('<h1>Hello world</h1>');
});

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});