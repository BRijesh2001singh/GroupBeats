import express,{Express} from "express";
import http from "http";
import { Server} from "socket.io";
import {Redis} from "ioredis";
import router from "./routes/routes";
import cors from "cors";
import { createRateLimiter } from "./utility/rateLimiter";
import dotenv from "dotenv";
const app:Express=express();
const server=http.createServer(app);

///cors setting 
app.use(cors({
    origin:process.env.CLIENT_URL, // Allows requests from this frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Methods to allow
    allowedHeaders: ['Content-Type', 'Authorization'] // Headers to allow
}));
const io =new Server(server,{
    cors:{
        origin:process.env.CLIENT_URL,
        methods:["GET","POST","PUT","DELETE"]
    }
})
dotenv.config();
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(router);
interface SongData{
    roomcode:string,
    songname:string,
    title:string,
    thumbnail:string,
    votes?:number,
    songUrl?:string
}
interface RoomData{
    users: string[];
    songs: SongData[];
    currentlyPlaying:{}
}
// dev redis
// const redisPub=new Redis({host:"127.0.0.1",port:6379}); 
// const redisSub=new Redis({host:"127.0.0.1",port:6379});
const redis_client=process.env.REDIS_CLIENT;
if(!redis_client){
throw new Error("Redis enviornment variable not set");
}
    const redisPub= new Redis(redis_client);
    const redisSub= new Redis(redis_client);
//RAtE LIMITER INITIALIZATION
const rateLimiter=createRateLimiter({
    maxRequest:5,
    maxTimeWindow:10,
    redisClient:redisPub
})


// Subscribe to the 'songroom' channel
redisSub.subscribe("songroom");
redisSub.on("message", (channel, message) => {
    if (channel === "songroom") {
        const { roomcode, event, payload } = JSON.parse(message);
        if (event === "get-songs") {
            // Broadcast the songs to all clients in the specified room
            io.to(roomcode).emit("get-songs", payload.songs);
        }
    }
});
    //check if room exists or not
    const checkRoomExists=async(roomcode:string):Promise<boolean>=>{
     const exists=await redisPub.exists(roomcode);
     return exists===1;
    }
    //store room state in redis
    const saveRoomData = (roomcode: string, data: RoomData) => {
        redisPub.set(roomcode, JSON.stringify(data), "EX", 36000, (err, result) => {
            if (err) {
                console.error("Error saving room data to Redis:", err);
            } else {
                console.log("Room data saved to Redis:", result);
            }
        });
    };
    
    //get room state from redis
    const getRoomData = async (roomcode: string) => {
        const roomData = await redisPub.get(roomcode);
        if (!roomData) {
            console.log("Room not found in Redis, initializing new room");
            return { users: [], songs: []};
        }
        return JSON.parse(roomData);
    };

    //currently playing redis data
    const getCurrentlyPlayingData=async(roomcode:string)=>{
        const currentPlayingRoomdata=await redisPub.get(roomcode);
        if(!currentPlayingRoomdata){
            return{currentlyPlaying:{}}
        }
        return JSON.parse(currentPlayingRoomdata);
    }
   //sort songs
   const sortSongsBasedOnVotes=async(data:SongData)=>{
      const {roomcode,votes,songname}=data;
      const roomData=await getRoomData(roomcode);
      const song=roomData.songs.find((s:SongData)=>s.songUrl===songname)//returns the ref to songs array not COPY
          song.votes=song.votes+votes;
          if(song.votes<0)song.votes=0;
            roomData.songs.sort((a:SongData,b:SongData)=>(b.votes||0)-(a.votes||0));
            saveRoomData(roomcode,roomData);
            io.to(roomcode).emit('get-songs',roomData.songs);
    } 
    io.on("connection",(socket)=>{
        socket.on("check-room",async({roomcode})=>{
            const check=await checkRoomExists(roomcode);
            if (check) {
                socket.emit("room-status", { exists: true});
            } else {
                socket.emit("room-status", { exists: false});
            }
        })
     
        socket.on("join-room",async({roomcode})=>{
        try {
            const roomdata=await getRoomData(roomcode);
            const currentlyPlayingRoomKey=roomcode+"currentsong";
            const currentlyPlayingSongData=await getCurrentlyPlayingData(currentlyPlayingRoomKey);
                roomdata.users.push(socket.id);
            saveRoomData(roomcode,roomdata);
            socket.join(roomcode);  
            console.log(`${socket.id} user has joined this ${roomcode} room`);
            //broadcast current song
            io.to(roomcode).emit("get-current-song",currentlyPlayingSongData)
            //broadcast to rooms
            io.to(roomcode).emit('get-songs',roomdata.songs);
            io.to(roomcode).emit("user-joined",roomcode);
            io.to(roomcode).emit("user-count",roomdata.users.length);

        } catch (error) {
            console.log("Error joining room");
        }
        })
        //adding current song of room to the redis
        socket.on("add-current-song",async({roomcode,song})=>{
            const currentlyPlayingRoomKey=roomcode+"currentsong";
            const currentlyPlayingRoomData=await getCurrentlyPlayingData(currentlyPlayingRoomKey);
            currentlyPlayingRoomData.currentlyPlaying=song;
            saveRoomData(currentlyPlayingRoomKey,currentlyPlayingRoomData);
            io.to(roomcode).emit("get-current-song",currentlyPlayingRoomData)
        })
        //handle messages 
        socket.on("add-song",async(data:SongData,callback)=>{
       ///rate limiter 
       const rateLimitKey=`rate-limit:add-song:${socket.id}`;
       const allowed=rateLimiter(rateLimitKey);
       if(!allowed){
        socket.emit("rate-limit-exceeded",{
            event:"add-songs",
            message:"Request Limit reached .Please wait before adding more songs."
        })
        return;
       }

            const { roomcode,title,songname,thumbnail } = data;
            const roomdata=await getRoomData(roomcode);
        if(roomdata.songs.find((s:SongData)=>s.songUrl===songname)){
            callback({status:"error"})
            return;
        }
            roomdata.songs.push({songname:title,songUrl:songname,thumbnail:thumbnail,votes:0});
            saveRoomData(roomcode,roomdata);
             // Publish the message to Redis to broadcast to all instances
             redisPub.publish(
                "songroom",
                JSON.stringify({
                  roomcode,
                  event: "get-songs",
                  payload: {songs:roomdata.songs},  
                })
              );
              callback({status:"success"})
        });
         //handle song removal
         socket.on("remove-song",async({roomcode,songUrl})=>{
            const roomData=await getRoomData(roomcode);
            roomData.songs = roomData.songs.filter((s: SongData) => {
                return s.songUrl !== songUrl;
              });           
              saveRoomData(roomcode,roomData); 
            io.to(roomcode).emit('get-songs',roomData.songs);
         })
          //handle votes
          socket.on("votes",async(data)=>{
            //Rate limiter for votes
              const rateLimitKey=`rate-limit:votes:${socket.id}`
              const allowed=await rateLimiter(rateLimitKey);
              if(!allowed){
                console.log("limit reached");
                socket.emit("rate-limit-exceeded",{
                    event:"votes",

                    message:"Request Limit exceeded.Please wait before adding morxe votes"
                })
                return;
              }
            //add votes and sort the songs based on votes 
           sortSongsBasedOnVotes(data);
        })

        // Handle user disconnection
    socket.on("disconnect", async () => {
        console.log("user disconnected");
        // Loop through all rooms the user is in and remove the user
        const allKeys = await redisPub.keys("*");
        const rooms = allKeys.filter((key) => 
            !key.includes("currentsong") && 
            !key.includes(`rate-limit:votes:${socket.id}`) && 
            !key.includes(`rate-limit:add-song:${socket.id}`)
        );// Exclude any keys with 'currentsong'
        for (const roomcode of rooms) {
            // Get the room data
            const roomData = await getRoomData(roomcode);
            roomData.users = roomData.users.filter((userId:string) => userId !== socket.id);
            saveRoomData(roomcode, roomData);
            //removing room from redis if room is empty
                        if (roomData.users.length === 0) {
                            //delete all the keys related to the room if all users left the room
                redisPub.del(roomcode);  
                redisPub.del(`${roomcode}currentsong`)
                redisPub.del(`rate-limit:votes:${socket.id}`);
                redisPub.del(`rate-limit:add-song:${socket.id}`);
            }
            // Broadcast to the room that the user has disconnected
                        io.to(roomcode).emit("user-count",-1);

            io.to(roomcode).emit("user-left", { roomcode, userId: socket.id });
        }
    });
    })
  


server.listen(process.env.PORT||8080,()=>console.log("server started"));