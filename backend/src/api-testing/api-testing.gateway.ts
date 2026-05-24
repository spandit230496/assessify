import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/api-testing',
  cors: { origin: '*', credentials: true },
})
export class ApiTestingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ApiTestingGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`API Testing client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`API Testing client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-workspace')
  handleJoinWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    client.join(`workspace:${data.workspaceId}`);
    this.logger.log(`Client ${client.id} joined workspace: ${data.workspaceId}`);
  }

  @SubscribeMessage('leave-workspace')
  handleLeaveWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    client.leave(`workspace:${data.workspaceId}`);
  }

  @SubscribeMessage('subscribe-execution')
  handleSubscribeExecution(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { historyId: string },
  ) {
    client.join(`execution:${data.historyId}`);
  }

  emitExecutionUpdate(historyId: string, update: Record<string, unknown>) {
    this.server.to(`execution:${historyId}`).emit('execution-update', update);
  }

  emitWorkspaceUpdate(workspaceId: string, event: string, data: Record<string, unknown>) {
    this.server.to(`workspace:${workspaceId}`).emit(event, data);
  }
}
