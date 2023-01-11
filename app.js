//setting basic server
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const {
    getCurrentUser,
    joinUser,
    userLeave,
    getRoomUsers
} = require('./utils/users')
const http = require('http');
const {
    formatMessage
} = require('./utils/message');
const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
//setting static folder
app.use(express.static(path.join(__dirname, 'public')));

//setting socket.io
const io = socketio(server);

const chatBotName = 'ChatCord Bot';
//Run when client connects
io.on("connection", socket => {

    //receving username and room from client
    socket.on("joinRoom", ({
        username,
        room
    }) => {
        const user = joinUser(socket.id, username, room);
        socket.join(user.room);
        //Welcome current user only
        socket.emit("message", formatMessage(chatBotName, "Welcome to ChatCord!"));

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit("message", formatMessage(chatBotName, `${user.username} has joined the chat`));
        //send users and room info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });
    });
    //Runs when client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        io.to(user.room).emit("message", formatMessage(chatBotName, `${user.username} has left the chat`));
    });
    //Listen for chatMessage
    socket.on("chatMessage", msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

})
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});