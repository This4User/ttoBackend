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
		this.service.initBoard;
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
				const moveResult = this.service.makeMove(moveData, socket.id);

				if (moveResult) {
					this.checkWin(moveResult);
				} else {
					this.io.to(this.roomData.id).emit(BoardEvents.makeMove, moveResult);
				}
				this.getBoard();
			});
		});
	}

	checkWin(winner: UserType | CellValue): void {
		if (typeof winner !== 'string') {
			const looser = this.roomData.players.find(player => player.id !== winner.id);
			if (looser) {
				console.log(`Game in room ${this.roomData.id} ended with winner ${winner.id}`);

				this.io.to(winner.id).emit(BoardEvents.gameFinished, true);
				this.io.to(looser.id).emit(BoardEvents.gameFinished, false);
			}
		} else {
			this.io.to(this.roomData.id).emit(BoardEvents.gameFinished, winner);
		}
	}
}

export default BoardController;