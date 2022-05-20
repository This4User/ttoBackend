import { Server, Socket } from 'socket.io';
import generateRoomId from '../utils/generateRoomId';
import RoomController, { RoomType } from './RoomController';

export type UserType = {
	id: string;
};

class RoomsController {

	private queue: Array<UserType> = [];
	private activeRooms: Array<RoomType> = [];
	private readonly io: Server;

	constructor(io: Server) {
		this.io = io;
	}

	addToQueue(user: UserType, socket: Socket): void {
		this.queue.push(user);
		console.log(`User with id: ${user.id} added to queue`);

		if (this.queue.length >= 2) {
			this.createRoom();
			this.activeRooms.forEach(room => {
				const roomController = new RoomController(room, this.io, socket);
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
			first_player_id: this.queue[0].id,
			second_player_id: this.queue[1].id,
		};

		this.activeRooms.push(roomData);

		this.removeFromQueue(roomData.first_player_id);
		this.removeFromQueue(roomData.second_player_id);

		console.log(`Created new room: ${JSON.stringify(roomData)}`);
	};
}

export default RoomsController;