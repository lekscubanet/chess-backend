import { v4 as uuidv4 } from 'uuid';
import { chessStore } from './chess.store';
import {
  ChessGameState,
  wsGetBoardMsg,
  wsGetBoardMsgOut,
  wsMoveMsg,
  wsMoveMsgOut,
  wsPlayerJoinMsg,
  wsPlayerJoinMsgOut,
  wsType,
} from '../types/chess';

import { ChessGame } from './chess.logic';

export class ChessService {
  createLobby(): object {
    const lobbyID = uuidv4();

    const newGame = new ChessGame(lobbyID, undefined);

    chessStore.addGame(newGame.getGame());

    return {
      success: true,
      lobbyID: lobbyID,
    };
  }

  getGameByID(gameID: string): ChessGameState | undefined {
    return chessStore.activeGames.find((elem) => elem.id === gameID);
  }

  getBoard(wsGetBoardMsg: wsGetBoardMsg): wsGetBoardMsgOut {
    let findGame = this.getGameByID(wsGetBoardMsg.payload.lobbyID);

    if (!findGame) {
      return { type: wsType.GETBOARD, status: 'ERROR' };
    }

    if (findGame.startTime > 0) {
      findGame.playingTime =
        Date.parse(new Date().toString()) - findGame.startTime;
    }

    return { type: wsType.GETBOARD, payload: findGame, status: 'SUCCESS' };
  }

  newPlayer(wsPlayerJoinMsg: wsPlayerJoinMsg): wsPlayerJoinMsgOut {
    const findBoard = this.getGameByID(wsPlayerJoinMsg.payload.lobbyID);

    const playerID = wsPlayerJoinMsg.payload.playerID
      ? wsPlayerJoinMsg.payload.playerID
      : uuidv4();
    let playerJoined = false;

    if (findBoard) {
      if (wsPlayerJoinMsg.payload.side === 'WHITE') {
        if (findBoard.players.white === null) {
          findBoard.players.white = {
            id: playerID,
            name: wsPlayerJoinMsg.payload.userName,
            mistakesCount: 0,
          };

          playerJoined = true;
        }
      } else if (wsPlayerJoinMsg.payload.side === 'BLACK') {
        if (findBoard.players.black === null) {
          findBoard.players.black = {
            id: playerID,
            name: wsPlayerJoinMsg.payload.userName,
            mistakesCount: 0,
          };

          playerJoined = true;
        }
      }
    }

    if (findBoard === undefined || !playerJoined) {
      return { type: wsType.PLAYERJOIN, status: 'ERROR' };
    }

    return {
      type: wsType.PLAYERJOIN,
      payload: findBoard,
      status: 'SUCCESS',
      playerID: playerID,
    };
  }

  newMove(gameID: string, wsMoveMsg: wsMoveMsg): wsMoveMsgOut {
    let findBoard = this.getGameByID(gameID);
    const newGame = new ChessGame(gameID, findBoard);

    if (
      findBoard === undefined ||
      wsMoveMsg.payload.piece.figure?.type === undefined
    ) {
      return { type: wsType.MOVE, status: 'ERROR' };
    }

    if (newGame.move(wsMoveMsg.payload.piece, wsMoveMsg.payload.to)) {
      return { type: wsType.MOVE, payload: findBoard, status: 'SUCCESS' };
    }

    return { type: wsType.MOVE, status: 'ERROR' };
  }

  getAllGames(): ChessGameState[] {
    return chessStore.activeGames;
  }

  checkUserInGame(userId: string, gameID: string): boolean {
    const findGame = chessStore.activeGames.find((elem) => elem.id === gameID);

    if (findGame) {
      if (
        findGame.players.white?.id === userId ||
        findGame.players.black?.id === userId
      ) {
        return true;
      }
    }

    return false;
  }
}
