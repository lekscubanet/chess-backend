import { Module } from '@nestjs/common';
import {ChessController} from "./chess/chess.controller";
import {ChessService} from "./chess/chess.service";
import {ChessModule} from "./chess/chess.module";
import {WebSocketModule} from "./websocket/websocket.module";


@Module({
  imports: [ChessModule, WebSocketModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
