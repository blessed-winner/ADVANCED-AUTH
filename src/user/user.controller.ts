import { Controller, Get, Post, Body, Patch, Param, Delete, Req, InternalServerErrorException, Put, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';

interface AuthenticatedRequest extends Request{
  user?:{ id:string }
}
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

 @Get('view/all')
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('view/:id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }


  @Delete('delete/:id')
  async delete(@Param('id') id:string){
    return await this.userService.remove(id)
  }

  @Get('profile')
  async viewProfile(@Req() req:AuthenticatedRequest){
     const userId = req?.user?.id;
     if(!userId) throw new UnauthorizedException("Cannot get authenticated user")
     return await this.userService.getProfile(userId)
  }

  @Put('profile')
  async updateProfile(
    @Req() req:AuthenticatedRequest,
    @Body() dto:UpdateUserDto
    ){
    const userId = req?.user?.id;
    if(!userId) throw new UnauthorizedException("Cannot get authenticated user")
     return await this.userService.updateProfile(userId,dto)
  }
 
}
