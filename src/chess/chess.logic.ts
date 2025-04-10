import {
    ChessBoard,
    ChessGameState,
    ChessPiece,
    ChessPos,
} from "../types/chess";
import {
    directionsBishop,
    directionsKing,
    directionsKnight,
    directionsQueen,
    directionsRook,
    letters,
    numbers
} from "./chess.const";
import {chessStore} from "./chess.store";


export class ChessGame {

    game: ChessGameState;

    constructor(lobbyID: string, game: ChessGameState | undefined) {

        if (game) {
            this.game = game
        } else {
            this.game = this.createNewGame(lobbyID);
            this.CalculateMoveOptions();
        }

    }

    getGame(): ChessGameState {
        return this.game;
    }

    createNewGame(lobbyID: string):  ChessGameState {

        return {
            id: lobbyID,
            board: this.createNewBoard(), // Заполненная начальная доска
            players: {
                white: null,
                black: null,
            },
            currentTurn: "WHITE",
            movesHistory: [],
            lostFigures: [],
            startTime: 0,
            playingTime: 0,
            status: "LOBBY",
            isCheck: false,
            isCheckmate: false
        }

    }

     createNewBoard(): ChessBoard {

        const startBoard: ChessBoard = Array(8).fill(null).map(() => Array(8).fill(null));


        for (let i = 0; i < 8; i++) {

            for (let j= 0; j < 8; j++) {

                let pos = letters[j] + '' + Math.abs((8 - i))
                startBoard[i][j] = { pos: pos, possibleMoves: []};

            }

        }

        startBoard[0][0].figure = { type:'ROOK', color: 'BLACK' };
        startBoard[0][1].figure = { type:'KNIGHT', color: 'BLACK' };
        startBoard[0][2].figure = { type:'BISHOP', color: 'BLACK' };
        startBoard[0][3].figure = { type:'KING', color: 'BLACK' };
        startBoard[0][4].figure = { type:'QUEEN', color: 'BLACK' };
        startBoard[0][5].figure = { type:'BISHOP', color: 'BLACK' };
        startBoard[0][6].figure = { type:'KNIGHT', color: 'BLACK' };
        startBoard[0][7].figure = { type:'ROOK', color: 'BLACK' };

        startBoard[1][0].figure = { type:'PAWN', color: 'BLACK' };
        startBoard[1][1].figure = { type:'PAWN', color: 'BLACK' };
        startBoard[1][2].figure = { type:'PAWN', color: 'BLACK' };
        startBoard[1][3].figure = { type:'PAWN', color: 'BLACK' };
        startBoard[1][4].figure = { type:'PAWN', color: 'BLACK' };
        startBoard[1][5].figure = { type:'PAWN', color: 'BLACK' };
        startBoard[1][6].figure = { type:'PAWN', color: 'BLACK' };
        startBoard[1][7].figure = { type:'PAWN', color: 'BLACK' };



        startBoard[6][0].figure = { type:'PAWN', color: 'WHITE' };
        startBoard[6][1].figure = { type:'PAWN', color: 'WHITE' };
        startBoard[6][2].figure = { type:'PAWN', color: 'WHITE' };
        startBoard[6][3].figure = { type:'PAWN', color: 'WHITE' };
        startBoard[6][4].figure = { type:'PAWN', color: 'WHITE' };
        startBoard[6][5].figure = { type:'PAWN', color: 'WHITE' };
        startBoard[6][6].figure = { type:'PAWN', color: 'WHITE' };
        startBoard[6][7].figure = { type:'PAWN', color: 'WHITE' };

        startBoard[7][0].figure = { type:'ROOK', color: 'WHITE' };
        startBoard[7][1].figure = { type:'KNIGHT', color: 'WHITE' };
        startBoard[7][2].figure = { type:'BISHOP', color: 'WHITE' };
        startBoard[7][3].figure = { type:'KING', color: 'WHITE' };
        startBoard[7][4].figure = { type:'QUEEN', color: 'WHITE' };
        startBoard[7][5].figure = { type:'BISHOP', color: 'WHITE' };
        startBoard[7][6].figure = { type:'KNIGHT', color: 'WHITE' };
        startBoard[7][7].figure = { type:'ROOK', color: 'WHITE' };


         return startBoard;

    }


     checkChessPieceByPos(piece: ChessPos): boolean {

        let findPiece = false;

        this.game.board.map((row) => {
            row.map((el) => {

                if (el.figure
                    && piece.figure
                    && el.pos === piece.pos
                    && el.figure.type === piece.figure.type
                    && el.figure.color === piece.figure.color) {

                    findPiece = true;
                }

            })
        })

        return findPiece;

    }



    Move(from: ChessPos, to: ChessPos):  boolean {

        if (from.figure && this.checkChessPieceByPos(from)) {

            let tempGameState = JSON.parse(JSON.stringify(this.game));

            const successMove = this.movePiece(from, to);

            if (successMove) {

                this.game.isCheck = false;

                this.game.currentTurn === 'WHITE' ? this.game.currentTurn = 'BLACK' : this.game.currentTurn = 'WHITE';

                this.CalculateMoveOptions();

                const whiteKingIsCheck = this.isCheck({'type': 'KING', 'color': 'WHITE'});
                const blackKingIsCheck = this.isCheck({'type': 'KING', 'color': 'BLACK'});

                if (this.game.currentTurn === 'BLACK' && whiteKingIsCheck) {

                    this.game = JSON.parse(JSON.stringify(tempGameState));
                    if (this.game.players.white) {
                        this.game.players.white.mistakesCount++;
                    }

                    chessStore.updateGame(this.game.id, this.game);

                    return true;

                } else if (this.game.currentTurn === 'WHITE' && blackKingIsCheck) {

                    this.game = JSON.parse(JSON.stringify(tempGameState));
                    if (this.game.players.black) {
                        this.game.players.black.mistakesCount++;
                    }

                    chessStore.updateGame(this.game.id, this.game);

                    return true;

                } else if (this.game.currentTurn === 'WHITE' && whiteKingIsCheck) {

                    this.game.isCheck = true;

                } else if (this.game.currentTurn === 'BLACK' && blackKingIsCheck) {

                    this.game.isCheck = true;

                }


                this.game.movesHistory.push({
                    from: from.pos,
                    to: to.pos,
                    chessPiece: from.figure,
                })


                if (this.game.startTime === 0) {
                    this.game.startTime = Date.parse(new Date().toString());
                    this.game.status = 'PLAYING';
                }

                this.game.playingTime = Date.parse(new Date().toString()) - this.game.startTime;

                if (to.figure !== undefined) {
                    this.game.lostFigures.push({
                        type: to.figure.type,
                        color: to.figure.color
                    })
                }

                chessStore.updateGame(this.game.id, this.game);

                return true;

            }

        }


        return false;


    }


    movePiece(from: ChessPos, to: ChessPos): boolean {

        let possibleMoves:string[] = [];
        let originalFrom: ChessPos;
        let successMove = false;

        this.game.board.forEach((row) => {
            row.forEach((el) => {

                if (el.pos === from.pos) {
                    originalFrom = el;
                    possibleMoves = el.possibleMoves;
                }

            })
        })


        this.game.board.forEach((row) => {
            row.forEach((el) => {

                if (el.pos === to.pos && possibleMoves.includes(el.pos)) {
                    el.figure = from.figure;
                    originalFrom.figure = undefined;
                    successMove = true;
                }

            })
        })


        return successMove;

    }

    CalculateMoveOptions()  {

        this.game.board.forEach((row, indexLetters) => {

            row.forEach((piece, indexNumbers) => {

                piece.possibleMoves.length = 0;

                switch (piece.figure?.type) {

                    case 'PAWN':

                        this.CalculatePawnPossibleMoves(piece, indexLetters, indexNumbers);

                        break;


                    case 'ROOK':

                        this.CalculatePossibleMoves(piece, directionsRook, indexLetters, indexNumbers);
                        break;

                    case 'KNIGHT':

                        this.CalculatePossibleMoves(piece, directionsKnight, indexLetters, indexNumbers);
                        break;


                    case 'BISHOP':

                        this.CalculatePossibleMoves(piece, directionsBishop, indexLetters, indexNumbers);
                        break;

                    case 'QUEEN':

                        this.CalculatePossibleMoves(piece, directionsQueen, indexLetters, indexNumbers);
                        break;

                }


            })

        })

        this.game.board.forEach((row, indexLetters) => {

            row.forEach((piece, indexNumbers) => {

                if (piece.figure?.type === 'KING') {
                    this.CalculateKingPossibleMoves(piece, directionsKing, indexLetters, indexNumbers);
                }

            })

        })

    }

    CalculatePawnPossibleMoves(
        piece:ChessPos,
        indexLetters:number,
        indexNumbers:number
    ) {

        if (piece.figure) {

            const direction = piece.figure.color === 'WHITE' ? -1 : 1;
            const startRow = piece.figure.color === 'WHITE' ? 6 : 1;


            if (this.game.board[indexLetters + direction][indexNumbers]?.figure === undefined) {

                piece.possibleMoves.push(letters[indexNumbers] + numbers[indexLetters + direction]);

            }


            if (startRow === indexLetters && this.game.board[indexLetters + 2 * direction][indexNumbers]?.figure === undefined) {

                piece.possibleMoves.push(letters[indexNumbers] + numbers[indexLetters + 2 * direction]);

            }

            if (indexLetters + direction >= 0 && indexLetters + direction <= 7) {

                if (indexNumbers + 1 <= 7) {

                    this.CalculatePawnPossibleAttack(piece, indexLetters, indexNumbers, direction, 1);

                }

                if (indexNumbers - 1 >= 0) {

                    this.CalculatePawnPossibleAttack(piece, indexLetters, indexNumbers, direction, -1);

                }

            }

        }

    }


    CalculatePawnPossibleAttack(
        piece: ChessPos,
        indexLetters: number,
        indexNumbers: number,
        direction: number,
        leftOrRight: number
    ) {

        if (piece.figure) {

            if (this.game.board[indexLetters + direction][indexNumbers + leftOrRight]?.figure !== undefined) {

                if (this.game.board[indexLetters + direction][indexNumbers + leftOrRight].figure?.color !== piece.figure.color) {

                    piece.possibleMoves.push(letters[indexNumbers + leftOrRight] + numbers[indexLetters + direction]);

                }

            }

        }

    }

    CalculateKingPossibleMoves(
        piece:ChessPos,
        directions:number[][],
        ILetters:number,
        INumbers:number
    ) {

        piece.possibleMoves.length = 0;

        if (piece.figure) {

            for (const [dr, dc] of directions) {
                let newRow = ILetters + dr;
                let newCol = INumbers + dc;

                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {

                    const cell = this.game.board[newRow][newCol];

                    if (cell.figure === undefined) {

                        piece.possibleMoves.push(letters[newCol] + numbers[newRow]);

                    } else {

                        if (cell.figure.color !== piece.figure.color) {

                            piece.possibleMoves.push(letters[newCol] + numbers[newRow]);

                        }

                    }

                }

            }

        }



    }


    CalculatePossibleMoves(
        piece:ChessPos,
        directions:number[][],
        ILetters:number,
        INumbers:number
    ) {

        if (piece.figure) {

            for (const [dr, dc] of directions) {
                let newRow = ILetters + dr;
                let newCol = INumbers + dc;

                while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    let cell = this.game.board[newRow][newCol];

                    if (cell.figure === undefined) {

                        piece.possibleMoves.push(letters[newCol] + numbers[newRow]);

                    } else {

                        if (cell.figure.color !== piece.figure.color) {

                            piece.possibleMoves.push(letters[newCol] + numbers[newRow]);

                        } else {

                        }

                        break;

                    }

                    if (piece.figure.type === 'KNIGHT') {
                        break;
                    }

                    newRow += dr;
                    newCol += dc;

                }

            }

        }

    }


    isCheck(side: ChessPiece): boolean {

        let kingPos = '';
        let isCheck = false;

        this.game.board.forEach((row) => {

            row.forEach((piece) => {

                if (piece.figure?.type === side.type && piece.figure?.color === side.color) {
                    kingPos = piece.pos
                }

            })

        })

        this.game.board.forEach((row) => {

            row.forEach((piece) => {

                if (piece.possibleMoves.includes(kingPos)) {
                    isCheck = true;
                }

            })

        })

        return isCheck;

    }



}





