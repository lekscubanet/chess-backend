import { Module } from '@nestjs/common';
import { ChessWebsocket } from './websocket.gateway';
import {ChessModule} from "../chess/chess.module";
import {WebsocketController} from "./websocket.controller";


@Module({
    imports: [ChessModule],
    controllers: [WebsocketController],
    providers: [ChessWebsocket],
})
export class WebSocketModule {}