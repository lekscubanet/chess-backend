import {Controller, Get} from '@nestjs/common';
import { ChessService } from './chess.service';

@Controller('api')
export class ChessController {
    constructor(private readonly ChessService: ChessService) {}

    @Get('/createlobby')
    createLobby(): string {
        return JSON.stringify(this.ChessService.createLobby());
    }



}
