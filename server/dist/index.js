"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const ioredis_1 = require("ioredis");
const routes_1 = __importDefault(require("./routes/routes"));
const cors_1 = __importDefault(require("cors"));
const rateLimiter_1 = require("./utility/rateLimiter");
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
///cors setting 
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', // Allows requests from this frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Methods to allow
    allowedHeaders: ['Content-Type', 'Authorization'] // Headers to allow
}));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});
dotenv_1.default.config();
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(routes_1.default);
//dev redis
// const redisPub=new Redis({host:"127.0.0.1",port:6379}); 
// const redisSub=new Redis({host:"127.0.0.1",port:6379});
const redis_client = process.env.REDIS_CLIENT;
if (!redis_client) {
    throw new Error("Redis enviornment variable not set");
}
const redisPub = new ioredis_1.Redis(redis_client);
const redisSub = new ioredis_1.Redis(redis_client);
//RAtE LIMITER INITIALIZATION
const rateLimiter = (0, rateLimiter_1.createRateLimiter)({
    maxRequest: 5,
    maxTimeWindow: 10,
    redisClient: redisPub
});
// Subscribe to the 'songroom' channel
redisSub.subscribe("songroom");
redisSub.on("message", (channel, message) => {
    if (channel === "songroom") {
        const { roomcode, event, payload } = JSON.parse(message);
        if (event === "get-songs") {
            console.log(`Broadcasting songs for room ${roomcode}`);
            // Broadcast the songs to all clients in the specified room
            io.to(roomcode).emit("get-songs", payload.songs);
        }
    }
});
//check if room exists or not
const checkRoomExists = (roomcode) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield redisPub.exists(roomcode);
    return exists === 1;
});
//store room state in redis
const saveRoomData = (roomcode, data) => {
    redisPub.set(roomcode, JSON.stringify(data), 'EX', 36000);
};
//get room state from redis
const getRoomData = (roomcode) => __awaiter(void 0, void 0, void 0, function* () {
    const roomData = yield redisPub.get(roomcode);
    return roomData ? JSON.parse(roomData) : { users: [], songs: [], currentlyPlaying: [] };
});
//sort songs
const sortSongsBasedOnVotes = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomcode, votes, songname } = data;
    const roomData = yield getRoomData(roomcode);
    const song = roomData.songs.find((s) => s.songUrl === songname); //returns the ref to songs array not COPY
    song.votes = song.votes + votes;
    if (song.votes < 0)
        song.votes = 0;
    roomData.songs.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    saveRoomData(roomcode, roomData);
    io.to(roomcode).emit('get-songs', roomData.songs);
});
io.on("connection", (socket) => {
    socket.on("check-room", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomcode }) {
        const check = yield checkRoomExists(roomcode);
        if (check) {
            socket.emit("room-status", { exists: true });
        }
        else {
            socket.emit("room-status", { exists: false });
        }
    }));
    socket.on("join-room", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomcode }) {
        try {
            const roomdata = yield getRoomData(roomcode);
            roomdata.users.push(socket.id);
            saveRoomData(roomcode, roomdata);
            socket.join(roomcode);
            console.log(`${socket.id} user has joined this ${roomcode} room`);
            //broadcast current song
            io.to(roomcode).emit("get-current-song", { currentsong: roomdata.currentlyPlaying[0] });
            //broadcast to rooms
            io.to(roomcode).emit('get-songs', roomdata.songs);
            io.to(roomcode).emit("user-joined", roomcode);
        }
        catch (error) {
            console.log("Error joining room");
        }
    }));
    //adding current song of room to the redis
    socket.on("add-current-song", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomcode, song }) {
        const roomdata = yield getRoomData(roomcode);
        roomdata.currentlyPlaying.push(song);
        saveRoomData(roomcode, roomdata);
        io.to(roomcode).emit("get-current-song", { currentsong: roomdata.currentlyPlaying });
    }));
    //handle messages 
    socket.on("add-song", (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
        ///rate limiter 
        const rateLimitKey = `rate-limit:add-song:${socket.id}`;
        const allowed = rateLimiter(rateLimitKey);
        if (!allowed) {
            socket.emit("rate-limit-exceeded", {
                event: "add-songs",
                message: "Request Limit reached .Please wait before adding more songs."
            });
            return;
        }
        const { roomcode, title, songname, thumbnail } = data;
        const roomdata = yield getRoomData(roomcode);
        if (roomdata.songs.find((s) => s.songUrl === songname)) {
            callback({ status: "error" });
            return;
        }
        roomdata.songs.push({ songname: title, songUrl: songname, thumbnail: thumbnail, votes: 0 });
        saveRoomData(roomcode, roomdata);
        console.log(`new msg recieved from ${roomcode}`, songname);
        // Publish the message to Redis to broadcast to all instances
        redisPub.publish("songroom", JSON.stringify({
            roomcode,
            event: "get-songs",
            payload: { songs: roomdata.songs },
        }));
        callback({ status: "success" });
    }));
    //handle song removal
    socket.on("remove-song", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomcode, songUrl }) {
        const roomData = yield getRoomData(roomcode);
        roomData.songs = roomData.songs.filter((s) => {
            return s.songUrl !== songUrl;
        });
        saveRoomData(roomcode, roomData);
        io.to(roomcode).emit('get-songs', roomData.songs);
    }));
    //handle votes
    socket.on("votes", (data) => __awaiter(void 0, void 0, void 0, function* () {
        //Rate limiter for votes
        const rateLimitKey = `rate-limit:votes:${socket.id}`;
        const allowed = yield rateLimiter(rateLimitKey);
        if (!allowed) {
            console.log("limit reached");
            socket.emit("rate-limit-exceeded", {
                event: "votes",
                message: "Request Limit exceeded.Please wait before adding morxe votes"
            });
            return;
        }
        //add votes and sort the songs based on votes 
        sortSongsBasedOnVotes(data);
    }));
    // Handle user disconnection
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("user disconnected");
        // Loop through all rooms the user is in and remove the user
        const rooms = yield redisPub.keys("*");
        for (const roomcode of rooms) {
            // Get the room data
            const roomData = yield getRoomData(roomcode);
            roomData.users = roomData.users.filter((userId) => userId !== socket.id);
            saveRoomData(roomcode, roomData);
            //removing room from redis if room is empty
            if (roomData.users.length === 0) {
                redisPub.del(roomcode);
            }
            // Broadcast to the room that the user has disconnected
            io.to(roomcode).emit("user-left", { roomcode, userId: socket.id });
        }
    }));
});
server.listen(5000, () => console.log("server started"));
