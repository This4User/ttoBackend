import { Server } from 'socket.io';
import BoardController from './BoardController';
import { UserType } from './RoomsController';

export type RoomType = {
	id: string;
	players: Array<UserType>
};

export enum RoomEvents {
	leave = 'leave',
	gameStarted = 'gameStarted'
}

class RoomController {
	get id(): string {
		return this._id;
	}
	get players(): Array<UserType> {
		return this._players;
	}
	private io: Server;
	private board;
	private readonly _id: string;
	private _players: Array<UserType>;

	constructor(roomData: RoomType, io: Server) {
		this.io = io;
		this.board = new BoardController(io, roomData);
		this._id = roomData.id;
		this._players = roomData.players;
	}

	startGame(): void {
		setTimeout(() => {
			this.board.initBoard();
		}, 100);

		this.io.to(this._id).emit(RoomEvents.gameStarted);
		console.log(`Game started in room: ${this._id}`);
	}
}

export default RoomController;