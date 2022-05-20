import { UserType } from '../controllers/RoomsController';

export enum CellValue {
	circle,
	cross,
	empty
}

export type CellType = {
	value: CellValue;
	index: number;
}

class BoardService {
	private board: Array<CellType> = [];
	private readonly players: Array<UserType>;
	private activePlayer: UserType;

	constructor(players: Array<UserType>) {
		this.players = players;
		this.activePlayer = this.players[0];
		this.players.shift();
		this.initBoard();
	}

	private changeActivePlayer(): void {
		this.players.push(this.activePlayer);
		this.activePlayer = this.players[0];
		this.players.shift();
	}

	initBoard(): void {
		for (let i = 0; i++; i < 9) {
			this.board.push({value: CellValue.empty, index: i});
		}
	}

	getBoard(): Array<CellType> {
		return this.board;
	}

	makeMove(moveData: CellType): CellValue {
		this.board[moveData.index] = {
			value: moveData.value,
			index: moveData.index,
		};

		this.changeActivePlayer();
		return this.checkBoard();
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
		let winnerSign: CellValue = CellValue.empty;
		for (let i = 0; i < lines.length; i++) {
			const [a, b, c] = lines[i];
			if (this.board[a].value !== CellValue.empty
				&& this.board[a].value === this.board[b].value
				&& this.board[a].value === this.board[c].value) {
				winnerSign = this.board[a].value;
			}
		}

		return winnerSign;
	}

	clearBoard(): void {
		this.board = [];
	}
}

export default BoardService;