import {Controller, Get} from '@nestjs/common';
import {ChessWebsocket} from "./websocket.gateway";


@Controller('stats')
export class WebsocketController {
    constructor(private readonly ChessWebsocket: ChessWebsocket) {}

    @Get()
    showStat(): string {

        let html = ''

        html += '<h1>Игроки</h1>'

        html += '<table>';

        html += '<tr>';
            html += '<td>socketID</td>';
            html += '<td>userID</td>';
            html += '<td>gameID</td>';
        html += '</tr>';

        this.ChessWebsocket.showPlayersConnections().forEach((el) => {

            html += '<tr>';

                html += '<td>';
                    html += el.socketID
                html += '</td>';

                html += '<td>';
                    html += el.userID
                html += '</td>';

                html += '<td>';
                    html += el.gameID
                html += '</td>';

            html += '</tr>';

        })

        html += '</table>';

        html += '<br>';



        html += '<h1>Все сокеты</h1>'

        html += '<table>';

        html += '<tr>';
        html += '<td>socketID</td>';
        html += '</tr>';

        this.ChessWebsocket.getConnectedClients().forEach((el) => {

            html += '<tr>';

                html += '<td>';
                html += el.id
                html += '</td>';

            html += '</tr>';

        });

        html += '</table>';


        html += '<br>';

        html += '<h1>Все игры</h1>'

        html += '<table>';

        html += '<tr>';
        html += '<td>id</td>';
        html += '<td>players</td>';
        html += '<td>startTime</td>';
        html += '<td>isCheck</td>';
        html += '<td>winner</td>';
        html += '<td>status</td>';
        html += '</tr>';

        this.ChessWebsocket.getAllGames().forEach((el) => {

            html += '<tr>';

            html += '<td>';
            html += el.id
            html += '</td>';

            html += '<td>';
            html += JSON.stringify(el.players)
            html += '</td>';

            html += '<td>';
            html += JSON.stringify(el.startTime)
            html += '</td>';

            html += '<td>';
            html += JSON.stringify(el.isCheck)
            html += '</td>';

            html += '<td>';
            html += JSON.stringify(el.winner)
            html += '</td>';

            html += '<td>';
            html += JSON.stringify(el.status)
            html += '</td>';

            html += '</tr>';

            html += '<tr><td colspan="6">';
            html += JSON.stringify(el.board)
            html += '</td></tr>';

        })

        html += '</table>';

        return html;
    }



}
