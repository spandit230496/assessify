import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ApiTestingService } from './api-testing.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
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

@ApiTags('api-testing')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api-testing')
export class ApiTestingController {
  constructor(private readonly apiTestingService: ApiTestingService) {}

  // ─── WORKSPACES ──────────────────────────────────────────────

  @Post('workspaces')
  @ApiOperation({ summary: 'Create a new API testing workspace' })
  createWorkspace(@CurrentUser() user: JwtPayload, @Body() dto: CreateWorkspaceDto) {
    return this.apiTestingService.createWorkspace(user.sub, dto);
  }

  @Get('workspaces')
  @ApiOperation({ summary: 'List all workspaces for current user' })
  getWorkspaces(@CurrentUser() user: JwtPayload) {
    return this.apiTestingService.getWorkspaces(user.sub);
  }

  @Get('workspaces/:id')
  @ApiOperation({ summary: 'Get workspace details' })
  getWorkspace(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.apiTestingService.getWorkspace(user.sub, id);
  }

  @Put('workspaces/:id')
  @ApiOperation({ summary: 'Update workspace' })
  updateWorkspace(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.apiTestingService.updateWorkspace(user.sub, id, dto);
  }

  @Delete('workspaces/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete workspace (soft delete)' })
  deleteWorkspace(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.apiTestingService.deleteWorkspace(user.sub, id);
  }

  // ─── COLLECTIONS ─────────────────────────────────────────────

  @Post('workspaces/:workspaceId/collections')
  @ApiOperation({ summary: 'Create a new collection in workspace' })
  createCollection(
    @CurrentUser() user: JwtPayload,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateCollectionDto,
  ) {
    return this.apiTestingService.createCollection(user.sub, workspaceId, dto);
  }

  @Get('workspaces/:workspaceId/collections')
  @ApiOperation({ summary: 'List collections in workspace' })
  getCollections(@CurrentUser() user: JwtPayload, @Param('workspaceId') workspaceId: string) {
    return this.apiTestingService.getCollections(user.sub, workspaceId);
  }

  @Put('collections/:id')
  @ApiOperation({ summary: 'Update collection' })
  updateCollection(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.apiTestingService.updateCollection(user.sub, id, dto);
  }

  @Delete('collections/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete collection (soft delete)' })
  deleteCollection(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.apiTestingService.deleteCollection(user.sub, id);
  }

  // ─── REQUESTS ────────────────────────────────────────────────

  @Post('collections/:collectionId/requests')
  @ApiOperation({ summary: 'Create a new API request in collection' })
  createRequest(
    @CurrentUser() user: JwtPayload,
    @Param('collectionId') collectionId: string,
    @Body() dto: CreateRequestDto,
  ) {
    return this.apiTestingService.createRequest(user.sub, collectionId, dto);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get request details' })
  getRequest(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.apiTestingService.getRequest(user.sub, id);
  }

  @Put('requests/:id')
  @ApiOperation({ summary: 'Update request' })
  updateRequest(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateRequestDto,
  ) {
    return this.apiTestingService.updateRequest(user.sub, id, dto);
  }

  @Delete('requests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete request (soft delete)' })
  deleteRequest(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.apiTestingService.deleteRequest(user.sub, id);
  }

  // ─── EXECUTE ─────────────────────────────────────────────────

  @Post('execute')
  @ApiOperation({ summary: 'Execute an API request' })
  executeRequest(@CurrentUser() user: JwtPayload, @Body() dto: ExecuteRequestDto) {
    return this.apiTestingService.executeRequest(user.sub, dto);
  }

  // ─── ENVIRONMENTS ────────────────────────────────────────────

  @Post('workspaces/:workspaceId/environments')
  @ApiOperation({ summary: 'Create environment in workspace' })
  createEnvironment(
    @CurrentUser() user: JwtPayload,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateEnvironmentDto,
  ) {
    return this.apiTestingService.createEnvironment(user.sub, workspaceId, dto);
  }

  @Get('workspaces/:workspaceId/environments')
  @ApiOperation({ summary: 'List environments in workspace' })
  getEnvironments(@CurrentUser() user: JwtPayload, @Param('workspaceId') workspaceId: string) {
    return this.apiTestingService.getEnvironments(user.sub, workspaceId);
  }

  @Put('environments/:id')
  @ApiOperation({ summary: 'Update environment' })
  updateEnvironment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateEnvironmentDto,
  ) {
    return this.apiTestingService.updateEnvironment(user.sub, id, dto);
  }

  @Delete('environments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete environment (soft delete)' })
  deleteEnvironment(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.apiTestingService.deleteEnvironment(user.sub, id);
  }

  // ─── HISTORY ─────────────────────────────────────────────────

  @Get('history')
  @ApiOperation({ summary: 'Get request execution history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getHistory(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.apiTestingService.getHistory(user.sub, page, limit);
  }

  @Get('history/:id')
  @ApiOperation({ summary: 'Get history entry details' })
  getHistoryItem(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.apiTestingService.getHistoryItem(user.sub, id);
  }

  @Delete('history')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear request history' })
  clearHistory(@CurrentUser() user: JwtPayload) {
    return this.apiTestingService.clearHistory(user.sub);
  }

  // ─── TEAM ────────────────────────────────────────────────────

  @Post('workspaces/:workspaceId/members')
  @ApiOperation({ summary: 'Add team member to workspace' })
  addTeamMember(
    @CurrentUser() user: JwtPayload,
    @Param('workspaceId') workspaceId: string,
    @Body() body: { email: string; role: ApiWorkspaceRole },
  ) {
    return this.apiTestingService.addTeamMember(user.sub, workspaceId, body.email, body.role);
  }

  @Delete('workspaces/:workspaceId/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove team member from workspace' })
  removeTeamMember(
    @CurrentUser() user: JwtPayload,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.apiTestingService.removeTeamMember(user.sub, workspaceId, memberId);
  }
}
