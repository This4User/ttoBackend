import { Server } from 'socket.io';
import BoardController from './BoardController';
import { UserType } from './RoomsController';

export type RoomType = {
	id: string;
	players: Array<UserType>
};

class RoomController {
	private board;
	private readonly roomId: string;

	constructor(roomData: RoomType, io: Server) {
		this.board = new BoardController(io, roomData);
		this.roomId = roomData.id;
	}

	startGame(): void {
		this.board.initBoard();
		console.log(`Game started in room: ${this.roomId}`);
	}

}

export default RoomController;