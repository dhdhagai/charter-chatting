const express = require('express');
const fs = require('fs');
const path = require('path');
const messages = require("./messages.json");

const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);
let nicknames = [];

io.on("connection", (client) => {
    console.log("CONNECTION HAS BEEN CONFIRMED");

    client.on("name", (data) => {
        client.nickname = data;
        nicknames.push(data);

        // Broadcast to all connected clients that a new user has joined
        io.emit("join", `${data} has joined the chat!`);

        // Emit previous messages to the client
        client.emit("prevmsg", messages);
    });

    client.on("messages", (data) => {
        console.log(data);
        // Add timestamp to the message
        const timestamp = new Date().toLocaleTimeString();
        io.emit("messages", `${timestamp}  -  ${client.nickname}: ${data}`)
        // Update the messages array
        messages.push({ nickname: client.nickname, message: data, time: timestamp });
        console.log(messages);

        // Update the messages.json file
        const messagesFilePath = path.join(__dirname, 'messages.json');
        fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));
    });
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

server.listen(8000);
