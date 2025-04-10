import {makeAutoObservable} from "mobx";
import {ChessGameState} from "../types/chess";


class ChessStore {


    activeGames: ChessGameState[] = [];

    constructor() {
        makeAutoObservable(this);
    }


    addGame(game: ChessGameState) {
        this.activeGames.push(game);
    }

    updateGame(id: string, update: Partial<ChessGameState>) {
        const game = this.activeGames.find((g) => g.id === id);
        if (game) {
            Object.assign(game, update);
        }
    }

    removeGame(id: string) {
        this.activeGames = this.activeGames.filter((g) => g.id !== id);
    }

}

export const chessStore = new ChessStore();