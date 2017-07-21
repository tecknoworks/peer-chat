var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var usernames = {};
var rooms = ['Lobby 1','Lobby 2','Lobby 3',];

io.sockets.on('connection', function (socket) {
		socket.on('adduser', function(username){
		socket.username = username;
		socket.room = 'Lobby 1';
		usernames[username] = username;
		socket.join('Lobby 1');
		socket.emit('updatechat', 'SERVER', 'you have connected to the first lobby room');
		socket.broadcast.to('Lobby 1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'Lobby 1');

	});

	socket.on('room',function(newroom){
		var i;
		var roomFound=false;
		console.log(newroom);
		if (newroom=="")
			console.log("cannot join empty room");
		else
		{
		for (i=0;i<rooms.length;i++){
			if (rooms[i] == newroom)
				roomFound=true;
		}
		if (roomFound==false)
		{
			rooms.push(newroom);
			socket.room = newroom;
			socket.leave(socket.room);
			socket.join(newroom);
			socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
			socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
			socket.room = newroom;
			socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
			socket.emit('updaterooms', rooms, newroom);
		}
		else
		{
			socket.room = newroom;
			socket.leave(socket.room);
			socket.join(newroom);
			socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
			socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
			socket.room = newroom;
			socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
			socket.emit('updaterooms', rooms, newroom);
		}
		}
	});

	socket.on('sendchat', function (data) {
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});
	
	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});
