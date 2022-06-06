import { Server, Socket } from 'socket.io';
import generateRoomId from '../utils/generateRoomId';
import RoomController, { RoomEvents, RoomType } from './RoomController';

export type UserType = {
	id: string;
	name?: string;
	socket: Socket;
};

class RoomsController {

	private queue: Array<UserType> = [];
	private activeRooms: Array<RoomController> = [];
	private readonly io: Server;

	constructor(io: Server) {
		this.io = io;
	}

	addToQueue(player: UserType): void {
		if (!this.queue.includes(player)) {
			this.queue.push(player);
			console.log(`User with id: ${player.id} added to queue`);
		}

		if (this.queue.length >= 2) {
			this.createRoom();
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
		const roomController = new RoomController(roomData, this.io);
		roomController.startGame();

		this.activeRooms.push(roomController);

		console.log(`Created new room: ${roomData.id}`);
		this.activeRooms.forEach(room => {
			console.log(`Room: ${room.id}`);
		});
	};

	deleteRoom(userId: string): void {
		const room = this.activeRooms
			.find(room => {
				const players = room.players.find(player => player.id === userId);
				if (players) {
					return room;
				}
			});

		if (room) {
			this.io.to(room.id).emit(RoomEvents.leave);
			if (this.queue.length > 0) {
				console.log(`Was trying to leave room: ${room.id}`);
				this.activeRooms = this.activeRooms.filter(activeRoom => activeRoom.id !== room.id);
				console.log(`Room with id: ${room.id} was deleted`);
				room.players
					.forEach(player => {
						player.socket.leave(room.id);
						this.addToQueue(player);
					});
			} else {
				room.startGame();
			}
		}
	}
}

export default RoomsController;