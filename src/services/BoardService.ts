import { UserType } from '../controllers/RoomsController';

export enum CellValue {
	circle = 'circle',
	cross = 'cross',
	empty = 'empty'
}

export type CellType = {
	value: CellValue;
	index: number;
}

class BoardService {
	private board: Array<CellType> = [];
	private readonly players: Array<UserType>;
	private winnerSign: CellValue = CellValue.empty;
	private isPlayerSignCircle = true;

	private activePlayer: boolean = false;

	constructor(players: Array<UserType>) {
		this.players = players;
	}

	getActivePlayer(): UserType {
		return this.players[Number(this.activePlayer)];
	}

	private changeActivePlayer(): void {
		this.activePlayer = !this.activePlayer;
	}

	initBoard(): string {
		if (this.board.length < 9) {
			for (let i = 0; i < 9; i++) {
				const cell = {value: CellValue.empty, index: i};
				this.board.push(cell);
			}
		} else {
			this.winnerSign = CellValue.empty;
			this.board = [];
		}

		return 'Board initialize';
	}

	getBoard(): Array<CellType> {
		return this.board;
	}

	getPlayerSign(userId: string) {
		if (this.isPlayerSignCircle) {
			switch (userId) {
				case this.players[0].id:
					return CellValue.circle;
				case this.players[1].id:
					return CellValue.cross;
			}
		} else {
			switch (userId) {
				case this.players[1].id:
					return CellValue.circle;
				case this.players[0].id:
					return CellValue.cross;
			}
		}
	}

	makeMove(moveData: CellType): CellValue {
		this.board[moveData.index] = {
			value: moveData.value,
			index: moveData.index,
		};

		this.changeActivePlayer();
		return this.checkBoard();
	}

	getWinnerSign(): CellValue {
		return this.winnerSign;
	}

	checkBoard(): CellValue {
		const lines = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		];
		for (let i = 0; i < lines.length; i++) {
			const [a, b, c] = lines[i];
			if (this.board[a].value !== CellValue.empty
				&& this.board[a].value === this.board[b].value
				&& this.board[a].value === this.board[c].value) {
				this.winnerSign = this.board[a].value;
			}
		}

		return this.winnerSign;
	}

	clearBoard(): void {
		this.board = [];
	}
}

export default BoardService;