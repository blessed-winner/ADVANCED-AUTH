import { Controller, Get, Post, Body, Patch, Param, Delete, Req, InternalServerErrorException, Put, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiParam, ApiBody, ApiUnauthorizedResponse, ApiOkResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/guards/jwt.guard';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { Roles } from 'src/utils/decorators/role.decorator';
import { Role } from 'src/auth/entities/user.entity';

export interface AuthenticatedRequest extends Request{
  user?:{ id:string }
}
@ApiTags('User')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

 @UseGuards(RolesGuard)
 @Roles(Role.ADMIN) 
 @Get('view/all')
 @ApiOperation({summary:"View all users in the system"})
 @ApiOkResponse({ description: 'Users retrieved successfully' })
 @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll() {
    return await this.userService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('view/:id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiOkResponse({ description: 'User retrieved' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }


  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiOkResponse({ description: 'User deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async delete(@Param('id') id:string){
    return await this.userService.remove(id)
  }

  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  @Get('profile')
    @ApiOperation({ summary: 'Get authenticated user profile' })
    @ApiOkResponse({ description: 'User profile retrieved' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async viewProfile(@Req() req:AuthenticatedRequest){
     const userId = req?.user?.id;
     if(!userId) throw new UnauthorizedException("Cannot get authenticated user")
     return await this.userService.getProfile(userId)
  }

  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  @Put('profile')
    @ApiOperation({ summary: 'Update authenticated user profile' })
    @ApiBody({ type: UpdateUserDto })
    @ApiOkResponse({ description: 'User profile updated' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateProfile(
    @Req() req:AuthenticatedRequest,
    @Body() dto:UpdateUserDto
    ){
    const userId = req?.user?.id;
    if(!userId) throw new UnauthorizedException("Cannot get authenticated user")
     return await this.userService.updateProfile(userId,dto)
  }
 
}
