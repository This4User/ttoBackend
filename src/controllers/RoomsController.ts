import { Server, Socket } from 'socket.io';
import generateRoomId from '../utils/generateRoomId';
import RoomController, { RoomType } from './RoomController';

export type UserType = {
	id: string;
	socket: Socket;
};

class RoomsController {

	private queue: Array<UserType> = [];
	private activeRooms: Array<RoomType> = [];
	private readonly io: Server;

	constructor(io: Server) {
		this.io = io;
	}

	addToQueue(user: UserType): void {
		this.queue.push(user);
		console.log(`User with id: ${user.id} added to queue`);

		if (this.queue.length >= 2) {
			this.createRoom();
			this.activeRooms.forEach(room => {
				const roomController = new RoomController(room, this.io);
				roomController.startGame();
			});
		}
	};

	removeFromQueue(userID: string): void {
		this.queue = this.queue.filter(user => user.id !== userID);
		console.log(`User with id: ${userID} deleted from queue`);
	};

	private createRoom(): void {
		const roomData: RoomType = {
			id: generateRoomId(),
			players: [this.queue[0], this.queue[1]],
		};

		this.activeRooms.push(roomData);

		roomData.players.forEach(({socket, id}) => {
			socket.join(roomData.id);
			this.removeFromQueue(id);
		});

		console.log(`Created new room: ${roomData.id}`);
	};
}

export default RoomsController;