import { createAdapter } from '@socket.io/redis-adapter';
import express from 'express';
import http from 'http';
import { createClient } from 'redis';
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

const PORT = process.env.PORT || 3010;

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
            });
            pubClient.set(`user:${data.socket}`,`id:${data.id}`).then(() => {
                console.log(`SAVED: "user:${data.socket}":"id:${data.id}" added to set`)
            }).catch(err => {
                console.error(`ERROR: "user:${data.socket}":"id:${data.id}" not added to set`)
            });
        }else{
            console.error('userAddedRedis:: data.id attribute not found');
        }
    }else{
        console.error('userAddedRedis:: data.socket attribute not found');
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
        console.error('saveDataServer:: id attribute not found');
    }
}

const pubSubBroadcast = (message:any) => {
    const pVal = 1;
    console.log(`pubSubBroadcast message: `,JSON.parse(message));
    // io.emit('pubSubBroadcast',message);
    const {id,...data} = JSON.parse(message);

    // handle the broadcast in a way that it is not repeated to the sender
    if(id){
        pubClient.get(`pubsub:${id}`).then((present) => {
            if(present){
                console.log(`ALREADY PRESENT: "pubsub:${id}":${pVal} not added to set`);
            }else{
                pubClient.set(`pubsub:${id}`,`${pVal}`).then(() => {
                    // emit using the redis subscrived event
                    pubClient.get(`id:${id}`).then((socket) => {
                        if(socket){
                            io.to(socket).emit('broadcastPubSub',data);
                        }else{
                            console.error(`ERROR: "pubsub:${id}":${1} not added to set user ${id} not found`)
                        }
                    }).catch(err => {
                        console.error(`ERROR: "pubsub:${id}":${1} not added to set err:>> ${err}`)
                    });
                    console.log(`SAVED: "pubsub:${id}":${pVal} added to set`);
                }).catch(err => {
                    console.error(`ERROR: "pubsub:${id}":${pVal} not added to set err:>> ${err}`);
                });
            }
        }).catch(err => {
            console.error(`ERROR: "pubsub:${id}":${1} not added to set err:>> ${err}`)
        });
        // io.to(id).emit('pubSubBroadcast',data);
    }else{
        console.error('pubSubBroadcast:: id attribute not found');
    }
};

const channels = ['userAddedRedis','saveDataServer','pubSubBroadcast'];
subClient.subscribe(channels,(message,channel) => {
    if( channel === 'userAddedRedis'){
        userAddedRedis(message);
    }else if(channel === 'saveDataServer'){
        saveDataServer(message);
    }else if(channel === 'pubSubBroadcast'){
        pubSubBroadcast(message);
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
        socket.emit('newAdded',data);
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

    socket.on('pubSubBroadcast', async (data) => {
        await pubClient.publish('pubSubBroadcast',JSON.stringify(data));
        console.log('pubSubBroadcast :>> ', data);
    });

    socket.on('disconnect', async () => {
        console.log(`Client disconnected ${socket.id}`);

        // Remove related data stored in Redis
        // await pubClient.del(`id:${socket.id}`);
        // await pubClient.del(`data:${socket.id}`);
        pubClient.get(`user:${socket.id}`).then((user) => {
            if(user){
                console.log(`user:${socket.id} found`);
                pubClient.del(`id:${user}`).then(() => {
                    console.log(`DELETED: "id:${user}" from redis`);
                }).catch(err => {
                    console.error(`ERROR: "id:${user}" not deleted from redis err :>>`,err);
                });
                pubClient.del(`pubsub:${user}`).then(() => {
                    console.log(`DELETED: "pubsub:${user}" from redis`);
                }).catch(err => {
                    console.error(`ERROR: "pubsub:${user}" not deleted from redis err :>>`,err);
                });
            }else{
                console.error(`ERROR: "user:${socket.id}" not found`);
            }
            
        }).catch(err => {
            console.error(`ERROR: "user:${socket.id}" not founderr :>>`,err);
        });
    });
});


app.get('/api', (req:express.Request, res:express.Response) => {
    res.send({data:'req from server1'})
});
