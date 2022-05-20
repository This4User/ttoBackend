import { Server, Socket } from 'socket.io';
import BoardController from './BoardController';

export type RoomType = {
	id: string;
	first_player_id: string;
	second_player_id: string;
};

class RoomController {
	private board;
	private readonly roomId: string;

	constructor(roomData: RoomType, io: Server, socket: Socket) {
		this.board = new BoardController(io, socket, [
			{
				id: roomData.first_player_id,
			}, {
				id: roomData.second_player_id,
			},
		]);
		this.roomId = roomData.id;
	}

	startGame(): void {
		this.board.initBoard();
		console.log(`Game started in room: ${this.roomId}`);
	}

}

export default RoomController;