import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../database/prisma.service';
import { ApiWorkspaceRole } from '@prisma/client';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  CreateCollectionDto,
  UpdateCollectionDto,
  CreateRequestDto,
  UpdateRequestDto,
  ExecuteRequestDto,
  CreateEnvironmentDto,
  UpdateEnvironmentDto,
} from './dto';

@Injectable()
export class ApiTestingService {
  private readonly logger = new Logger(ApiTestingService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('api-execution') private readonly executionQueue: Queue,
  ) {}

  // ─── WORKSPACE METHODS ──────────────────────────────────────

  async createWorkspace(userId: string, dto: CreateWorkspaceDto) {
    const workspace = await this.prisma.aPIWorkspace.create({
      data: {
        name: dto.name,
        description: dto.description,
        isPersonal: dto.isPersonal ?? false,
        settings: dto.settings ?? {},
        ownerId: userId,
        teamMembers: {
          create: { userId, role: ApiWorkspaceRole.OWNER },
        },
      },
      include: { teamMembers: true },
    });
    this.logger.log(`Workspace "${workspace.name}" created by ${userId}`);
    return workspace;
  }

  async getWorkspaces(userId: string) {
    return this.prisma.aPIWorkspace.findMany({
      where: {
        isDeleted: false,
        teamMembers: { some: { userId } },
      },
      include: {
        _count: { select: { collections: true, teamMembers: true, environments: true } },
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getWorkspace(userId: string, workspaceId: string) {
    const workspace = await this.prisma.aPIWorkspace.findFirst({
      where: {
        id: workspaceId,
        isDeleted: false,
        teamMembers: { some: { userId } },
      },
      include: {
        collections: {
          where: { isDeleted: false, parentId: null },
          include: {
            children: { where: { isDeleted: false }, orderBy: { order: 'asc' } },
            requests: { where: { isDeleted: false }, orderBy: { order: 'asc' } },
          },
          orderBy: { order: 'asc' },
        },
        environments: { where: { isDeleted: false } },
        teamMembers: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
            },
          },
        },
        variables: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async updateWorkspace(userId: string, workspaceId: string, dto: UpdateWorkspaceDto) {
    await this.assertWorkspaceRole(userId, workspaceId, [
      ApiWorkspaceRole.OWNER,
      ApiWorkspaceRole.ADMIN,
    ]);
    return this.prisma.aPIWorkspace.update({
      where: { id: workspaceId },
      data: dto,
    });
  }

  async deleteWorkspace(userId: string, workspaceId: string) {
    await this.assertWorkspaceRole(userId, workspaceId, [ApiWorkspaceRole.OWNER]);
    return this.prisma.aPIWorkspace.update({
      where: { id: workspaceId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  // ─── COLLECTION METHODS ─────────────────────────────────────

  async createCollection(userId: string, workspaceId: string, dto: CreateCollectionDto) {
    await this.assertWorkspaceRole(userId, workspaceId, [
      ApiWorkspaceRole.OWNER,
      ApiWorkspaceRole.ADMIN,
      ApiWorkspaceRole.EDITOR,
    ]);
    return this.prisma.aPICollection.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
        parentId: dto.parentId,
        order: dto.order ?? 0,
      },
    });
  }

  async getCollections(userId: string, workspaceId: string) {
    await this.assertWorkspaceMember(userId, workspaceId);
    return this.prisma.aPICollection.findMany({
      where: { workspaceId, isDeleted: false, parentId: null },
      include: {
        children: {
          where: { isDeleted: false },
          include: { requests: { where: { isDeleted: false }, orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        requests: { where: { isDeleted: false }, orderBy: { order: 'asc' } },
      },
      orderBy: { order: 'asc' },
    });
  }

  async updateCollection(userId: string, collectionId: string, dto: UpdateCollectionDto) {
    const collection = await this.prisma.aPICollection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('Collection not found');
    await this.assertWorkspaceRole(userId, collection.workspaceId, [
      ApiWorkspaceRole.OWNER,
      ApiWorkspaceRole.ADMIN,
      ApiWorkspaceRole.EDITOR,
    ]);
    return this.prisma.aPICollection.update({ where: { id: collectionId }, data: dto });
  }

  async deleteCollection(userId: string, collectionId: string) {
    const collection = await this.prisma.aPICollection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('Collection not found');
    await this.assertWorkspaceRole(userId, collection.workspaceId, [
      ApiWorkspaceRole.OWNER,
      ApiWorkspaceRole.ADMIN,
      ApiWorkspaceRole.EDITOR,
    ]);
    return this.prisma.aPICollection.update({
      where: { id: collectionId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  // ─── REQUEST METHODS ────────────────────────────────────────

  async createRequest(userId: string, collectionId: string, dto: CreateRequestDto) {
    const collection = await this.prisma.aPICollection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('Collection not found');
    await this.assertWorkspaceRole(userId, collection.workspaceId, [
      ApiWorkspaceRole.OWNER,
      ApiWorkspaceRole.ADMIN,
      ApiWorkspaceRole.EDITOR,
    ]);
    return this.prisma.aPIRequest.create({
      data: { collectionId, ...dto },
    });
  }

  async getRequest(userId: string, requestId: string) {
    const request = await this.prisma.aPIRequest.findFirst({
      where: { id: requestId, isDeleted: false },
      include: {
        collection: true,
        responses: { orderBy: { createdAt: 'desc' }, take: 10 },
        testCases: true,
        assertions: true,
      },
    });
    if (!request) throw new NotFoundException('Request not found');
    await this.assertWorkspaceMember(userId, request.collection.workspaceId);
    return request;
  }

  async updateRequest(userId: string, requestId: string, dto: UpdateRequestDto) {
    const request = await this.prisma.aPIRequest.findUnique({
      where: { id: requestId },
      include: { collection: true },
    });
    if (!request) throw new NotFoundException('Request not found');
    await this.assertWorkspaceRole(userId, request.collection.workspaceId, [
      ApiWorkspaceRole.OWNER,
      ApiWorkspaceRole.ADMIN,
      ApiWorkspaceRole.EDITOR,
    ]);
    return this.prisma.aPIRequest.update({ where: { id: requestId }, data: dto });
  }

  async deleteRequest(userId: string, requestId: string) {
    const request = await this.prisma.aPIRequest.findUnique({
      where: { id: requestId },
      include: { collection: true },
    });
    if (!request) throw new NotFoundException('Request not found');
    await this.assertWorkspaceRole(userId, request.collection.workspaceId, [
      ApiWorkspaceRole.OWNER,
      ApiWorkspaceRole.ADMIN,
      ApiWorkspaceRole.EDITOR,
    ]);
    return this.prisma.aPIRequest.update({
      where: { id: requestId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  // ─── EXECUTE REQUEST ────────────────────────────────────────

  async executeRequest(userId: string, dto: ExecuteRequestDto) {
    this.validateUrl(dto.url);

    const history = await this.prisma.aPIHistory.create({
      data: {
        userId,
        method: dto.method,
        url: dto.url,
        requestHeaders: dto.headers ?? {},
        requestBody: dto.body,
        status: 'PENDING',
      },
    });

    await this.executionQueue.add(
      'execute-api-request',
      {
        historyId: history.id,
        userId,
        method: dto.method,
        url: dto.url,
        headers: dto.headers,
        queryParams: dto.queryParams,
        pathParams: dto.pathParams,
        authType: dto.authType,
        authConfig: dto.authConfig,
        bodyType: dto.bodyType,
        body: dto.body,
        timeoutMs: dto.timeoutMs ?? 30000,
        followRedirects: dto.followRedirects ?? true,
      },
      {
        attempts: 1,
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );

    this.logger.log(`API request queued: ${dto.method} ${dto.url} (history: ${history.id})`);
    return { historyId: history.id, status: 'QUEUED' };
  }

  // ─── ENVIRONMENT METHODS ────────────────────────────────────

  async createEnvironment(userId: string, workspaceId: string, dto: CreateEnvironmentDto) {
    await this.assertWorkspaceRole(userId, workspaceId, [
      ApiWorkspaceRole.OWNER,
      ApiWorkspaceRole.ADMIN,
      ApiWorkspaceRole.EDITOR,
    ]);
    return this.prisma.aPIEnvironment.create({
      data: {
        workspaceId,
        name: dto.name,
        variables: dto.variables ?? [],
        isActive: dto.isActive ?? false,
      },
    });
  }

  async getEnvironments(userId: string, workspaceId: string) {
    await this.assertWorkspaceMember(userId, workspaceId);
    return this.prisma.aPIEnvironment.findMany({
      where: { workspaceId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateEnvironment(userId: string, environmentId: string, dto: UpdateEnvironmentDto) {
    const env = await this.prisma.aPIEnvironment.findUnique({ where: { id: environmentId } });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertWorkspaceRole(userId, env.workspaceId, [
      ApiWorkspaceRole.OWNER,
      ApiWorkspaceRole.ADMIN,
      ApiWorkspaceRole.EDITOR,
    ]);
    return this.prisma.aPIEnvironment.update({ where: { id: environmentId }, data: dto });
  }

  async deleteEnvironment(userId: string, environmentId: string) {
    const env = await this.prisma.aPIEnvironment.findUnique({ where: { id: environmentId } });
    if (!env) throw new NotFoundException('Environment not found');
    await this.assertWorkspaceRole(userId, env.workspaceId, [
      ApiWorkspaceRole.OWNER,
      ApiWorkspaceRole.ADMIN,
    ]);
    return this.prisma.aPIEnvironment.update({
      where: { id: environmentId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  // ─── HISTORY METHODS ────────────────────────────────────────

  async getHistory(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.aPIHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.aPIHistory.count({ where: { userId } }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getHistoryItem(userId: string, historyId: string) {
    const item = await this.prisma.aPIHistory.findFirst({
      where: { id: historyId, userId },
    });
    if (!item) throw new NotFoundException('History entry not found');
    return item;
  }

  async clearHistory(userId: string) {
    const result = await this.prisma.aPIHistory.deleteMany({ where: { userId } });
    return { deleted: result.count };
  }

  // ─── TEAM METHODS ──────────────────────────────────────────

  async addTeamMember(
    userId: string,
    workspaceId: string,
    memberEmail: string,
    role: ApiWorkspaceRole,
  ) {
    await this.assertWorkspaceRole(userId, workspaceId, [
      ApiWorkspaceRole.OWNER,
      ApiWorkspaceRole.ADMIN,
    ]);

    const member = await this.prisma.user.findUnique({ where: { email: memberEmail } });
    if (!member) throw new NotFoundException('User not found');

    const existing = await this.prisma.aPITeamMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: member.id } },
    });
    if (existing) throw new BadRequestException('User is already a member');

    return this.prisma.aPITeamMember.create({
      data: { workspaceId, userId: member.id, role },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async removeTeamMember(userId: string, workspaceId: string, memberId: string) {
    await this.assertWorkspaceRole(userId, workspaceId, [
      ApiWorkspaceRole.OWNER,
      ApiWorkspaceRole.ADMIN,
    ]);

    const workspace = await this.prisma.aPIWorkspace.findUnique({ where: { id: workspaceId } });
    if (workspace?.ownerId === memberId) {
      throw new ForbiddenException('Cannot remove workspace owner');
    }

    return this.prisma.aPITeamMember.delete({
      where: { workspaceId_userId: { workspaceId, userId: memberId } },
    });
  }

  // ─── HELPER METHODS ────────────────────────────────────────

  private async assertWorkspaceMember(userId: string, workspaceId: string) {
    const member = await this.prisma.aPITeamMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');
    return member;
  }

  private async assertWorkspaceRole(
    userId: string,
    workspaceId: string,
    roles: ApiWorkspaceRole[],
  ) {
    const member = await this.assertWorkspaceMember(userId, workspaceId);
    if (!roles.includes(member.role)) {
      throw new ForbiddenException('Insufficient workspace permissions');
    }
    return member;
  }

  private validateUrl(url: string) {
    const blockedPatterns = [
      /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)/i,
      /^https?:\/\/10\.\d+\.\d+\.\d+/,
      /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/,
      /^https?:\/\/192\.168\.\d+\.\d+/,
      /^https?:\/\/169\.254\.\d+\.\d+/,
      /^file:\/\//,
      /^ftp:\/\//,
    ];

    for (const pattern of blockedPatterns) {
      if (pattern.test(url)) {
        throw new BadRequestException(
          'Request to internal/private addresses is not allowed (SSRF protection)',
        );
      }
    }
  }
}
