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

	constructor(io: Server, socket: Socket, players: Array<UserType>) {
		this.io = io;
		this.socket = socket;
		this.service = new BoardService(players);
	}

	initBoard(): void {
		this.io.emit('message', this.service.initBoard());
		this.getBoard();
		this.listenMoves();
	}

	private getBoard(): void {
		this.io.emit('message', this.service.getBoard());
	}

	restart(): void {
		this.socket.on(BoardEvents.restart, () => {
			this.service.clearBoard();
			this.service.initBoard();
		});
	}

	listenMoves(): void {
		this.socket.on(BoardEvents.makeMove, (moveData: CellType) => {
			this.io.emit('message', this.service.makeMove(moveData));
			this.getBoard();
		});
	}
}

export default BoardController;