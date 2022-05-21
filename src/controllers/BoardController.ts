import { Server } from 'socket.io';
import BoardService, { CellType, CellValue } from '../services/BoardService';
import { RoomType } from './RoomController';

export enum BoardEvents {
	initBoard = 'initBoard',
	makeMove = 'makeMove',
	restart = 'restart',
	getBoard = 'getBoard'
}

class BoardController {
	private io: Server;
	private roomData: RoomType;
	private service;

	constructor(io: Server, roomData: RoomType) {
		this.io = io;
		this.roomData = roomData;
		this.service = new BoardService(roomData.players);
	}

	initBoard(): void {
		this.io.to(this.roomData.id).emit('message', this.service.initBoard());
		this.getBoard();
		this.listenMoves();
	}

	private getBoard(): void {
		this.io.to(this.roomData.id).emit('message', this.service.getBoard());
	}

	restart(): void {
		this.roomData.players.forEach(({socket}) => {
			socket.on(BoardEvents.restart, () => {
				this.service.clearBoard();
				this.service.initBoard();
			});
		});
	}

	listenMoves(): void {
		this.roomData.players.forEach(({socket, id}) => {
			socket.on(BoardEvents.makeMove, (moveData: CellType) => {
				const isActivePlayer = id === this.service.getActivePlayer().id;
				const isMoveExist = this.service.getBoard()[moveData.index].value === CellValue.empty;
				const isCanMove = isActivePlayer && isMoveExist;

				if (isCanMove) {
					this.io.to(this.roomData.id).emit('message', this.service.makeMove(moveData));
					this.getBoard();
				}
			});
		});
	}
}

export default BoardController;