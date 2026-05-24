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
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/assessment',
})
export class AssessmentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AssessmentGateway.name);
  private activeUsers = new Map<string, { socketId: string; attemptId: string }>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [userId, data] of this.activeUsers.entries()) {
      if (data.socketId === client.id) {
        this.activeUsers.delete(userId);
        this.server.emit('candidate-disconnected', { userId });
        break;
      }
    }
  }

  @SubscribeMessage('join-assessment')
  handleJoinAssessment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; attemptId: string; assessmentId: string },
  ) {
    client.join(`assessment:${data.assessmentId}`);
    client.join(`attempt:${data.attemptId}`);
    this.activeUsers.set(data.userId, {
      socketId: client.id,
      attemptId: data.attemptId,
    });

    this.server.to(`assessment:${data.assessmentId}`).emit('candidate-joined', {
      userId: data.userId,
      timestamp: new Date(),
    });

    this.logger.log(`User ${data.userId} joined assessment ${data.assessmentId}`);
  }

  @SubscribeMessage('timer-sync')
  handleTimerSync(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { attemptId: string; remainingSeconds: number },
  ) {
    client.emit('timer-update', {
      remainingSeconds: data.remainingSeconds,
      serverTime: new Date(),
    });
  }

  @SubscribeMessage('answer-saved')
  handleAnswerSaved(
    @ConnectedSocket() _client: Socket,
    @MessageBody()
    data: {
      attemptId: string;
      questionId: string;
      status: string;
    },
  ) {
    this.server.to(`attempt:${data.attemptId}`).emit('answer-updated', data);
  }

  @SubscribeMessage('violation-detected')
  handleViolation(
    @ConnectedSocket() _client: Socket,
    @MessageBody()
    data: {
      attemptId: string;
      assessmentId: string;
      userId: string;
      type: string;
      details: string;
    },
  ) {
    this.server.to(`assessment:${data.assessmentId}`).emit('violation-alert', {
      ...data,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('proctor-message')
  handleProctorMessage(
    @ConnectedSocket() _client: Socket,
    @MessageBody()
    data: {
      attemptId: string;
      message: string;
    },
  ) {
    this.server.to(`attempt:${data.attemptId}`).emit('proctor-notification', {
      message: data.message,
      timestamp: new Date(),
    });
  }

  emitAutoSubmit(attemptId: string) {
    this.server.to(`attempt:${attemptId}`).emit('force-submit', { reason: 'Time expired' });
  }

  getActiveUsers() {
    return Array.from(this.activeUsers.entries()).map(([userId, data]) => ({
      userId,
      ...data,
    }));
  }
}
