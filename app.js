var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var socket = 8080;
server.listen(socket);
console.log('listening on: ', socket);


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


var usernames = {};
var rooms = ['Lobby 1','Lobby 2','Lobby 3'];
var map = {};
map['Lobby 1']=[];
map['Lobby 2']=[];
map['Lobby 3']=[];

io.sockets.on('connection', function (socket) {
		socket.on('adduser', function(username) {
		socket.username = username;
		socket.room = 'Lobby 1';
		usernames[username] = username;
		socket.join('Lobby 1');
		socket.emit('updatechat', 'SERVER', 'you have connected to the first lobby room');
		socket.broadcast.to('Lobby 1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'Lobby 1');
		});

	socket.on('room',function(newroom) {
		var i;
		var roomFound=false;
		var key;
		console.log(newroom);
		if (newroom=="") {
			//console.log("cannot join empty room");
		}
		else {	
			for (key in map) {
				if (key == newroom) {
					roomFound=true;
					console.log(roomFoud);
				}
			}
		if (roomFound==false) {
			console.log(roomFound);
			rooms.push(newroom);
			map[newroom]=[];
			map[newroom].push(socket);
			for (key in Object.keys(map)) {
				for (roomcheck in map[key]) {
					if (map[key][roomcheck]==socket.room) {
						delete map[key][roomcheck];
				}	
				delete usernames[socket.username];
				io.sockets.emit('updateusers', usernames);
				socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
				socket.leave(socket.room);
			}
		}
			//console.log(map);
			//console.log(map[newroom]);
			socket.room = map[newroom];
			socket.leave(socket.room);
			socket.join(map[newroom]);
			socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
			socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
			socket.room = map[newroom];
			socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');	
			socket.emit('updaterooms', rooms  );
			console.log("6");

		}
			else {	
				map[newroom].push(socket);
				//console.log(map);
				for (key in Object.keys(map)) {
					for (roomcheck in map[key]) {
						if (map[key][roomcheck]==socket.room) {
							delete map[key][roomcheck];
				}	
				delete usernames[socket.username];
				io.sockets.emit('updateusers', usernames);
				socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
				socket.leave(socket.room);
			}
		}
				socket.room = map[newroom];
				socket.leave(socket.room);
				socket.join(map[newroom]);
				socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
				socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
				socket.room = map[newroom];
				socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
				socket.emit('updaterooms', rooms);
			}
		}
	});

	socket.on('sendchat', function (data) {
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	socket.on('switchRoom', function(newroom) {
		map[newroom].push(socket);
		//console.log(map);
		for (key in Object.keys(map)) {
			for (roomcheck in map[key]) {
				if (map[key][roomcheck]==socket.room) {
					delete map[key][roomcheck];
				}	
				delete usernames[socket.username];
				io.sockets.emit('updateusers', usernames);
				socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
				socket.leave(socket.room);
			}
		}
		socket.room=map[newroom];
		socket.leave(socket.room);
		socket.join(map[newroom]);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		socket.room = map[newroom];
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms);
	});
	
	socket.on('disconnect', function() {
		var key;
		var roomcheck;
		for (key in Object.keys(map)) {
			for (roomcheck in map[key]) {
				if (map[key][roomcheck]==socket.room) {
					delete map[key][roomcheck];
				}	
				delete usernames[socket.username];
				io.sockets.emit('updateusers', usernames);
				socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
				socket.leave(socket.room);
			}
		}
	});
});
