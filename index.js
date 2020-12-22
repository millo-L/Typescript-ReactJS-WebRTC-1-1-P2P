let express = require('express');
let http = require('http');
let app = express();
let cors = require('cors');
let server = http.createServer(app);
let socketio = require('socket.io');
let io = socketio.listen(server);

app.use(cors());
const PORT = process.env.PORT || 8080;

let users = {};

let socketToRoom = {};

const maximum = 4;

io.on('connection', socket => {
    socket.on('join_room', data => {
        if (users[data.room]) {
            const length = users[data.room].length;
            if (length === maximum) {
                socket.to(socket.id).emit('room_full');
                return;
            }
            users[data.room].push({id: socket.id, email: data.email});
        } else {
            users[data.room] = [{id: socket.id, email: data.email}];
        }
        socketToRoom[socket.id] = data.room;
        console.log(`[${socketToRoom[socket.id]}]: ${socket.id} enter`);

        const usersInThisRoom = users[data.room].filter(user => user.id !== socket.id);

        console.log(usersInThisRoom);

        io.sockets.to(socket.id).emit('all_users', usersInThisRoom);
    });

    socket.on('offer', sdp => {
        console.log(sdp);
        socket.broadcast.emit('getOffer', sdp);
    });

    socket.on('answer', sdp => {
        console.log(sdp);
        socket.broadcast.emit('getAnswer', sdp);
    });

    socket.on('candidate', candidate => {
        console.log(candidate);
        socket.broadcast.emit('getCandidate', candidate);
    })

    socket.on('disconnect', () => {
        console.log(`[${socketToRoom[socket.id]}]: ${socket.id} exit`);
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(user => user.id !== socket.id);
            users[roomID] = room;
        }
        socket.broadcast.to(room).emit('user_exit', {id: socket.id});
        console.log(users);
    })
});

server.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});