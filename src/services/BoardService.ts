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

	private activePlayer: boolean = false;

	constructor(players: Array<UserType>) {
		this.players = players;
		this.initBoard();
	}

	getActivePlayer(): UserType {
		return this.players[Number(this.activePlayer)]
	}

	private changeActivePlayer(): void {
		this.activePlayer = !this.activePlayer;
	}

	initBoard(): string {
		for (let i = 0; i < 9; i++) {
			const cell = {value: CellValue.empty, index: i};

			this.board.push(cell);
		}

		return 'Board initialize';
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