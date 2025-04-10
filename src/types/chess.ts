export type gameStatuses = 'LOBBY' | 'PLAYING' | 'CHECKMATE' | 'DRAW'
export type figureType = 'KING' | 'QUEEN' | 'ROOK' | 'BISHOP' | 'KNIGHT' | 'PAWN'
export type figureColor = 'WHITE' | 'BLACK';

export interface ChessPiece {
    type: figureType;
    color: figureColor;
}

export interface ChessPos {
    figure?: ChessPiece;
    pos: string;
    possibleMoves: string[];
}

export type ChessBoard = (ChessPos)[][];


export interface ChessPlayer {
    id: string;
    name: string;
    mistakesCount: number;
}

export interface ChessMove {
    from: string;
    to: string;
    chessPiece: ChessPiece;
}

export interface ChessGameState {
    id: string;
    board: ChessBoard;
    players: {
        white: ChessPlayer | null;
        black: ChessPlayer | null;
    };
    currentTurn: figureColor;
    movesHistory: ChessMove[];
    lostFigures: ChessPiece[];
    status: gameStatuses;
    winner?: ChessPlayer | null;
    startTime: number;
    playingTime: number;
    isCheck: boolean;
    isCheckmate: boolean;
}





// WEBSOCKET


export enum wsType {
    'GETBOARD' = 'GETBOARD',
    'PLAYERJOIN' =  'PLAYERJOIN',
    'MOVE' =  'MOVE',
    'CHAT' = 'CHAT'
}

type wsStatuses = 'SUCCESS' | 'ERROR';

export interface wsUsers {
    socketID: string;
    userID: string;
    gameID: string;
}

export interface wsGetBoardPayload {
    lobbyID: string;
}

export interface wsGetBoardMsg {
    type: wsType.GETBOARD;
    payload: wsGetBoardPayload;
}

export interface wsGetBoardMsgOut {
    type: wsType.GETBOARD;
    payload?: ChessGameState;
    status: wsStatuses;
}



export interface wsPlayerJoinPayload {
    lobbyID: string;
    playerID: string;
    side: figureColor;
    userName: string;
}

export interface wsPlayerJoinMsg {
    type: wsType.PLAYERJOIN;
    payload: wsPlayerJoinPayload;
}

export interface wsPlayerJoinMsgOut {
    type: wsType.PLAYERJOIN;
    payload?: ChessGameState;
    status: wsStatuses;
    playerID?: string;
}



export interface wsMovePayload {
    piece: ChessPos;
    to: ChessPos;
}

export interface wsMoveMsg {
    type: wsType.MOVE;
    payload: wsMovePayload;
}

export interface wsMoveMsgOut {
    type: wsType.MOVE;
    payload?: ChessGameState;
    status: wsStatuses;
}
