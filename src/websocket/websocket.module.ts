import { Module } from '@nestjs/common';
import { ChessWebsocket } from './websocket.gateway';
import { ChessModule } from '../chess/chess.module';

@Module({
  imports: [ChessModule],
  controllers: [],
  providers: [ChessWebsocket],
})
export class WebSocketModule {}
