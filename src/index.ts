import { NextFunction, Request, Response } from 'express';
import { Server, Socket } from 'socket.io';
import { RoomEvents } from './controllers/RoomController';
import RoomsController from './controllers/RoomsController';

const express = require('express');
const cors = require('cors');

require('dotenv').config();
const port = process.env.PORT;

const app = express();
const httpServer = require('http').createServer(app);
const io: Server = new Server(httpServer);

app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});
app.get('/', (req: Request, res: any) => {
	return res.json({status: 'ok'});
});

const rooms = new RoomsController(io);

io.on('connection', (socket: Socket) => {
	socket.on('addToQueue', () => {
		rooms.addToQueue({
			id: socket.id,
			socket,
		});
	});
	socket.on('disconnect', () => {
		rooms.removeFromQueue(socket.id);
		console.log(`User with id ${socket.id} disconnected`);
	});

	socket.on(RoomEvents.leave, () => {
		rooms.deleteRoom(socket.id);
	});
});

httpServer.listen(port, () => {
	console.log(`listening on ${port}`);
});