import { Server } from 'socket.io';
import BoardService, { CellType, CellValue } from '../services/BoardService';
import { RoomType } from './RoomController';
import { UserType } from './RoomsController';

export enum BoardEvents {
	initBoard = 'initBoard',
	makeMove = 'makeMove',
	getBoard = 'getBoard',
	getPlayerSign = 'getPlayerSign',
	gameFinished = 'gameFinished',
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
		this.io.to(this.roomData.id).emit(BoardEvents.initBoard, this.service.initBoard());
		this.roomData.players.forEach(player => {
			this.io.to(player.id).emit(BoardEvents.getPlayerSign, this.service.getPlayerSign(player.id));
		});
		this.getBoard();
		this.listenMoves();
	}

	private getBoard(): void {
		this.io.to(this.roomData.id).emit(BoardEvents.getBoard, this.service.getBoard());
	}

	listenMoves(): void {
		this.roomData.players.forEach(({socket, id}) => {
			socket.on(BoardEvents.makeMove, (moveData: CellType) => {
				const activePayer = this.service.getActivePlayer();
				const isActivePlayer = id === activePayer.id;
				const isMoveExist = this.service.getBoard()[moveData.index].value === CellValue.empty;
				const isCanMove = isActivePlayer && isMoveExist;
				const winnerSign = this.service.getWinnerSign();

				if (isCanMove && winnerSign === CellValue.empty) {
					this.io.to(this.roomData.id).emit(BoardEvents.makeMove, this.service.makeMove(moveData));
					this.getBoard();

					this.checkWin(activePayer);
				}
			});
		});
	}

	checkWin(winner: UserType): void {
		const winnerSign = this.service.getWinnerSign();
		if (winnerSign !== CellValue.empty) {
			console.log(`Game in room ${this.roomData.id} ended with winner ${winner.id}`);

			this.io.to(this.roomData.id).emit(BoardEvents.gameFinished, winner.id);
		}
	}
}

export default BoardController;