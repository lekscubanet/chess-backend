import { v4 as uuidv4 } from 'uuid';
import {chessStore} from "./chess.store";
import {
  ChessGameState,
  wsGetBoardMsg,
  wsGetBoardMsgOut, wsMoveMsg, wsMoveMsgOut, wsPlayerJoinMsg, wsPlayerJoinMsgOut,
  wsType
} from "../types/chess";

import {ChessGame } from "./chess.logic";



export class ChessService {

  createLobby(): object {

    const lobbyID = uuidv4();

    const newGame = new ChessGame(lobbyID, undefined);

    chessStore.addGame(newGame.getGame());

    return {
      success: true,
      lobbyID: lobbyID
    }

  }




  getGameByID(id: string): ChessGameState | undefined {

    return  chessStore.activeGames.find(elem => elem.id === id);

  }

  getBoard(obj: wsGetBoardMsg): wsGetBoardMsgOut {

    let findGame = this.getGameByID(obj.payload.lobbyID);

    if (!findGame) {

      return {'type': wsType.GETBOARD, 'status': 'ERROR'};

    }

    if (findGame.startTime > 0) {
      findGame.playingTime = Date.parse(new Date().toString()) - findGame.startTime;
    }


    return {'type': wsType.GETBOARD, 'payload': findGame, 'status': 'SUCCESS'};

  }


  newPlayer(obj: wsPlayerJoinMsg): wsPlayerJoinMsgOut {

    const findBoard = this.getGameByID(obj.payload.lobbyID)

    const playerID = obj.payload.playerID ? obj.payload.playerID : uuidv4();
    let playerJoined = false;

    if (findBoard) {

      if (obj.payload.side === 'WHITE') {

        if (findBoard.players.white === null) {

          findBoard.players.white = {
            id: playerID,
            name: obj.payload.userName,
            mistakesCount: 0
          }

          playerJoined = true;

        }

      } else if (obj.payload.side === 'BLACK') {

        if (findBoard.players.black === null) {

          findBoard.players.black = {
            id: playerID,
            name: obj.payload.userName,
            mistakesCount: 0
          }

          playerJoined = true;

        }

      }

    }

    if (findBoard === undefined || !playerJoined) {
      return {'type': wsType.PLAYERJOIN, 'status': 'ERROR'};
    }

    return {'type': wsType.PLAYERJOIN, 'payload': findBoard, 'status': 'SUCCESS', 'playerID': playerID};


  }


  newMove(gameID: string, obj: wsMoveMsg): wsMoveMsgOut {

    let findBoard = this.getGameByID(gameID);
    const newGame = new ChessGame(gameID, findBoard);

    if (findBoard === undefined || obj.payload.piece.figure?.type === undefined) {
      return {'type': wsType.MOVE, 'status': 'ERROR'};
    }


    if (newGame.Move(obj.payload.piece, obj.payload.to)) {
      return {'type': wsType.MOVE, 'payload': findBoard, 'status': 'SUCCESS'};
    }

    return {'type': wsType.MOVE, 'status': 'ERROR'};


  }





  getAllGames(): ChessGameState[] {
    return  chessStore.activeGames
  }

  checkUserInGame(userId: string, gameID: string): boolean {

    const findGame = chessStore.activeGames.find(elem => elem.id === gameID)

    if (findGame) {

      if (findGame.players.white?.id === userId || findGame.players.black?.id === userId) {
        return true;
      }

    }

    return false;

  }



}
