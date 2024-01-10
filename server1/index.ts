import { createAdapter } from '@socket.io/redis-adapter';
import express from 'express';
import http from 'http';
import { createClient } from 'redis';
// import {Redis} from 'ioredis';
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: '*',
        methods: ['GET', 'POST','PUT','DELETE'],
        allowedHeaders: ['user-cred'],
        credentials: true
    }
});

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

const userAddedRedis = (message:any) => {
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
}

const saveDataServer = (message:any) => {
    console.log(`saveDataServer message: `,JSON.parse(message));
    let {id,...data} = JSON.parse(message);
    
    if(id){
        pubClient.set(`data:${id}`,JSON.stringify(data)).then(() => {
            console.log(`SAVED: "data:${id}":${JSON.stringify(data)} added to set`)
        }).catch(err => {
            console.error(`ERROR: "data${id}":${JSON.stringify(data)} not added to set err:>> ${err}`)
        })
    }else{
        console.error('id attribute not found');
    }
}

const channels = ['userAddedRedis','saveDataServer'];
subClient.subscribe(channels,(message,channel) => {
    if( channel === 'userAddedRedis'){
        userAddedRedis(message);
    }else if(channel === 'saveDataServer'){
        saveDataServer(message);
    }
}).then(() => {
    channels.forEach(channel => {
        console.log(channel,'subscribed');
    });
}).catch(err => {
    console.log('err :>> ', err);
});


io.on('connection', async (socket) => {
    console.log(`user connected socket: ${socket.id}`)

    socket.on('addNew', async (data) => {
        await pubClient.publish('userAddedRedis', JSON.stringify({...data, socket: socket.id}));
        console.log('addNew :>> ', data);
        io.emit('newAdded',data);
    });

    socket.on('getUser', async (data) => {
        const usersocket = await pubClient.get(`id:${data.id}`);
        console.log('getUser :>> ', data);
        socket.emit('sentUser',{socket: usersocket});
    });

    socket.on('saveData', async (data) => {
        await pubClient.publish('saveDataServer',JSON.stringify(data));
        console.log('saveData :>> ', data);
        socket.emit('savedData',data);
    });

    socket.on('getData', async (id) => {
        const serverData = await pubClient.get(`data:${id}`);
        console.log('getData :>> ',id, serverData);
        socket.emit('gotData',serverData);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected ${socket.id}`);
    });
});


app.get('/api', (req:express.Request, res:express.Response) => {
    res.send({data:'req from server1'})
});
