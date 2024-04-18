import "./helper/sendResponse"
import express, {Express} from 'express';
import dotenv from 'dotenv';
dotenv.config();
import router from "./routes";
const app:Express = express();
const port = process.env.PORT || 3001;
import cors from "cors";
import fileUpload from "express-fileupload"
import cookieParser from "cookie-parser";
import http from "http"
import socket  from "socket.io";
import chetHelper from "./db/chatHelper";

// config & db
import "./db/db";

const cors_urls = [
  "http://localhost:3001",
  "https://549a-2405-201-2024-a1f6-ac16-b76-5212-fbb6.ngrok-free.app",
  "http://localhost:4001"
]

app.use(
  cors({
    origin: cors_urls,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));
app.use(router)

// socket 

const server = http.createServer(app);
const io = new socket.Server(server, {
  cors: (cors, callback) => {
    if (cors_urls.includes(cors.headers["origin"])) {
      callback(null, { origin: true, credentials: false });
    } else {
      // callback(new Error("Not allowed by CORS"));
      callback(null, { origin: true, credentials: false });
    }
  },
});
global.Onscreen = {}
global.onlineUsers = []
const socketUsers = new Map();

io.on('connection', socket => {
  socket.on('joinRoom', data => {
    socketUsers.set(socket.id, data.user);
    if(!global.onlineUsers.includes(data.user)){
      global.onlineUsers.push(data.user)
    }
    socket.join(data.user);
    socket.emit("message", `Welcome to the room.`);
    io.emit("isOnline", {onlineUsers:global.onlineUsers})
  });

  socket.on('sendMessage', async data => {
    const sender = data.sender;
    const receiver = data.receiver;
    if(sender > receiver){
      data.conversationId = data.receiver + data.sender;
    }else{
      data.conversationId = data.sender + data.receiver;
    }
    const receiverScreen = global.Onscreen[data.receiver]
    if (receiverScreen == data.sender){
      data.read = true
    }
    socket.to(data.receiver).emit("sendMessage",data);
    await chetHelper.insertOne(data);

  })

  socket.on('onScreen', async data => {
    global.Onscreen[data.userId] = data.screenId;
  })

  socket.on("typing", (data) => {
    socket
      .to(global.Onscreen[data.userId])
      .emit("typing", { typing: data.typing });
  });

  socket.on("callRequest", (data) => {
    console.log(data);
    socket.to(data.to._id).emit("sendCallRequest", {
      to: data.from,
      from: data.to,
      signal: data.signalData,
    });
  });

  socket.on("answerCall", (data) => {
    console.log(data);
  });
  
  socket.on("disconnect", () => {
    console.log("disconnect");
    const user = socketUsers.get(socket.id);
    if (global.onlineUsers.includes(user)) {
      const i = global.onlineUsers.indexOf(user);
      global.onlineUsers.splice(i, 1);
      io.emit("isOnline", { onlineUsers: global.onlineUsers });
    }
    socketUsers.delete(socket.id);
  });
});


server.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});