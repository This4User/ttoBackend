import { Server } from 'socket.io';
import BoardController from './BoardController';
import { UserType } from './RoomsController';

export type RoomType = {
	id: string;
	players: Array<UserType>
};

export enum RoomEvents {
	leave = 'leave',
	restart = 'restart',
	gameStarted = 'gameStarted',
	playAgain = 'playAgain',
	countdown = 'countdown'
}

class RoomController {
	private io: Server;
	private board;
	private readonly roomId: string;
	private players: Array<UserType>;

	constructor(roomData: RoomType, io: Server) {
		this.io = io;
		this.board = new BoardController(io, roomData);
		this.roomId = roomData.id;
		this.players = roomData.players;
	}

	startGame(): void {
		setTimeout(() => {
			this.board.initBoard();
		},100);
		this.io.to(this.roomId).emit(RoomEvents.gameStarted);
		console.log(`Game started in room: ${this.roomId}`);
	}

	listenRoomEvents(): void {
		this.liveRoom();
		this.playAgain();
	}

	playAgain(): void {
		this.players.forEach(({socket, id}) => {
			let isWantGameAgain = false;
			socket.on(RoomEvents.playAgain, () => {
				const secondPlayer = this.players.find(player => player.id !== id);
				if (secondPlayer) {
					this.io.to(secondPlayer.id).emit(RoomEvents.playAgain);

					secondPlayer.socket.on(RoomEvents.playAgain, () => {
						isWantGameAgain = true;
					});

					let countTic = 15;
					const countdown = setInterval(() => {
						this.io.to(this.roomId).emit(RoomEvents.countdown, countTic);
						countTic--;
						if (countTic === 1) {
							this.io.to(this.roomId).emit(RoomEvents.leave);
							clearInterval(countdown);
						}
					}, 1000);
				}
			});
		});
	}

	liveRoom(): void {
		this.players.forEach(({socket, id}) => {
			socket.on(RoomEvents.leave, () => {
				const stayedPlayer = this.players.find(player => player.id !== id);
				if (stayedPlayer) {
					this.io.to(stayedPlayer.id).emit(RoomEvents.leave);
				}
				socket.leave(this.roomId);
				console.log(`Player with id ${socket.id} leaved room`);
			});
		});
	}
}

export default RoomController;