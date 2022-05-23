import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import RoomsController from './controllers/RoomsController';

const express = require('express');
const cors = require('cors');

require('dotenv').config();
const port = process.env.PORT;

const app = express();
const httpServer = require('http').createServer(app);
const io: Server = new Server(httpServer, {
	cors: {
		origin: 'http://localhost:2800',
		methods: ['GET', 'POST'],
	},
});

app.use(cors());
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
});

httpServer.listen(port, () => {
	console.log(`listening on ${port}`);
});