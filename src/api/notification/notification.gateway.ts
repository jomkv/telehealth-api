import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ENV_VARS } from 'src/shared/env-variables';

@WebSocketGateway({
  cors: {
    origin: ENV_VARS.clientUrl(),
    credentials: true,
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    console.log(`CONN detected before: ${this.userSockets.size}`);

    const userId = client.handshake.auth.userId;
    if (userId) this.userSockets.set(userId, client.id);

    console.log(`CONN detected after: ${this.userSockets.size}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`DC detected before: ${this.userSockets.size}`);

    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }

    console.log(`DC detected after: ${this.userSockets.size}`);
  }

  emitToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  emitToUsers(userIds: string[], notification: any) {
    for (const userId of userIds) {
      this.emitToUser(userId, notification);
    }
  }
}
