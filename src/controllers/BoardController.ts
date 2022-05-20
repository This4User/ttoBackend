import { Server, Socket } from 'socket.io';
import BoardService, { CellType } from '../services/BoardService';
import { UserType } from './RoomsController';

export enum BoardEvents {
	initBoard = 'initBoard',
	makeMove = 'makeMove',
	restart = 'restart',
	getBoard = 'getBoard'
}

class BoardController {
	private io: Server;
	private socket: Socket;
	private service;

	constructor(io: Server, socket: Socket , players: Array<UserType>) {
		this.io = io;
		this.socket = socket;
		this.service = new BoardService(players);
	}

	initBoard(): void {
		this.socket.on(BoardEvents.initBoard, ({message}) => {
			this.service.initBoard();
		});
		this.getBoard();
	}

	private getBoard(): void {
		this.socket.on(BoardEvents.getBoard, () => {
			this.io.emit(BoardEvents.getBoard, this.service.getBoard());
		});
	}

	restart(): void {
		this.socket.on(BoardEvents.restart, () => {
			this.service.clearBoard();
			this.service.initBoard();
		});
	}

	makeMove(moveData: CellType): void {
		this.socket.on(BoardEvents.makeMove, () => {
			this.io.emit(BoardEvents.makeMove, this.service.makeMove(moveData));
		});
	}
}

export default BoardController;