import { Server, Socket } from 'socket.io';
import generateRoomId from '../utils/generateRoomId';
import RoomController, { RoomType } from './RoomController';

export type UserType = {
	id: string;
	name?: string;
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
			const roomData = this.activeRooms[this.activeRooms.length - 1];
			const roomController = new RoomController(roomData, this.io);
			roomController.startGame();
			roomController.listenRoomEvents();
		}
	};

	removeFromQueue(userID: string): void {
		if (this.queue.find(user => user.id === userID)) {
			this.queue = this.queue.filter(user => user.id !== userID);
			console.log(`User with id: ${userID} deleted from queue`);
		}
	};

	private createRoom(): void {
		const roomData: RoomType = {
			id: generateRoomId(),
			players: [this.queue[0], this.queue[1]],
		};

		roomData.players.forEach(({socket, id}) => {
			socket.join(roomData.id);
			this.removeFromQueue(id);
		});

		this.activeRooms.push(roomData);

		console.log(`Created new room: ${roomData.id}`);
		console.log(this.activeRooms);
	};

	private deleteRoom(): void {
		this.io.on('leaveRoom', (roomID) => {
			this.activeRooms
				.find(room => room.id = roomID)?.players
				.forEach(player => {
					player.socket.leave(roomID);
					this.addToQueue(player);
				});
			this.activeRooms.filter(room => room.id !== roomID);
		});
	}
}

export default RoomsController;