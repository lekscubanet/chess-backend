import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {ChessService} from "../chess/chess.service";
import {wsType, wsUsers} from "../types/chess";



@WebSocketGateway(5555, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    },
})


export class ChessWebsocket implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
   @WebSocketServer()
    server: Server;

    constructor(private readonly gameService: ChessService) {}

    private wsUsers: wsUsers[] = [];



    @SubscribeMessage('MSG')
    handleEvent(
        @MessageBody() data: string, // или ваш интерфейс/DTO
        @ConnectedSocket() client: Socket
   ): void {

        const datajson = JSON.parse(data);

        switch (datajson.type) {

            case 'GETBOARD':

                client.emit('MSGs', JSON.stringify(this.gameService.getBoard(datajson)));
                break;

            case 'PLAYERJOIN':

                const newPlayer = this.gameService.newPlayer(datajson);

                if (newPlayer.status === 'SUCCESS' && newPlayer.playerID && newPlayer.payload) {
                    this.joinNewPlayer(newPlayer.playerID, client.id, newPlayer.payload.id);

                    client.emit('MSGs', JSON.stringify(newPlayer));

                    this.sendToAllViewersByGame(newPlayer.payload.id,
                        JSON.stringify(this.gameService.getBoard(
                            {'type': wsType.GETBOARD, 'payload': {'lobbyID': newPlayer.payload.id}}
                        ))
                    );
                }

                break;

            case 'MOVE':

                const gameID = this.wsUsers.find((el) => el.socketID === client.id)?.gameID

                if (gameID) {

                    const newMove = this.gameService.newMove(gameID, datajson);

                    if (newMove.status === 'SUCCESS' && newMove.payload) {
                        this.sendToAllViewersByGame(gameID, JSON.stringify(newMove));
                    }

                }


                break;

            default:
                console.log('unknown msg');
                console.log(datajson);
                break;
        }
   }

    public joinNewPlayer(userID: string, socketID: string, gameID: string): void {

        const findWSuser = this.wsUsers.find((el) => el.socketID === socketID)

        if (findWSuser) {
            findWSuser.userID = userID
        } else {
            this.wsUsers.push({socketID, userID, gameID});
        }

    }

    public sendToAll(type: string, message: string): void {
        this.server.emit(type, message);
    }

    public sendToAllViewersByGame(gameID: string, message: string): void {

        this.wsUsers.forEach((el) => {
            if (el.gameID === gameID) {
                this.server.to(el.socketID).emit('MSGs', message);
            }
        })


    }



    public getConnectedClients() {

        const clientsList = Array.from(this.server.sockets.sockets.values()).map(socket => ({
            id: socket.id
        }));
        return clientsList;
    }

    public showPlayersConnections(): wsUsers[] {
        return this.wsUsers;
    }

    public getAllGames() {
        return this.gameService.getAllGames();
    }

    afterInit(server: Server) {
        console.log("Server started");
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);

        const cookies = client.handshake.headers.cookie;
        let gameID = client.handshake.query.gameid;

        if (Array.isArray(gameID)) {
            gameID = gameID[0];
        }

        if (gameID) {

            if (cookies) {

                const parsedCookies = this.parseCookies(cookies);

                if (parsedCookies.chess) {

                    if (this.gameService.checkUserInGame(parsedCookies.chess, gameID)) {

                        this.joinNewPlayer(parsedCookies.chess, client.id, gameID);

                    } else {

                        this.joinNewPlayer('', client.id, gameID);

                    }

                }

            } else {
                this.joinNewPlayer('', client.id, gameID);
            }

        }

    }

    handleDisconnect(client: Socket) {

        console.log(`Client disconnected: ${client.id}`);

        const finsUser = this.wsUsers.find((el) => el.socketID === client.id);

        if (finsUser) {
            this.wsUsers.splice(this.wsUsers.indexOf(finsUser), 1);
        }

    }

    private parseCookies(cookies: string): Record<string, string> {
        return cookies.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});
    }


}