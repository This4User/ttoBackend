import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import RoomsController from './controllers/RoomsController';

require('dotenv').config();
const port = process.env.PORT;

const httpServer = createServer();
const io: Server = new Server(httpServer);

const rooms = new RoomsController(io);

io.on('connection', (socket: Socket) => {

	rooms.addToQueue({
		id: socket.id,
	}, socket);

	socket.on('message', ({message}) => {
		io.emit('message', message);
	});
});

httpServer.listen(port, () => {
	console.log(`listening on ${port}`);
});