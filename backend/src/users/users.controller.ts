import {
  Controller,
  Get,
  Put,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'List all users' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: Role,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(page, limit, role, search);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Get('stats')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user statistics' })
  async getStats() {
    return this.usersService.getUserStats();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.sub, dto);
  }

  @Patch(':id/deactivate')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate a user' })
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate a user' })
  async activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Patch(':id/role')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Change user role' })
  async changeRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.usersService.changeRole(id, role);
  }
}
