import redis from 'redis';

//redis setup
const client = redis.createClient({url: process.env.REDIS_URL, legacyMode: true});

(async()=>{
    client.on('error', (err)=>{
        console.error("redis client error", err);
    });

    client.on('ready',()=>{
        console.log('redis client ready')
    })

    await client.connect();

    await client.ping();
})();


export default client