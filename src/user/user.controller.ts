import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

 @Get('view/all')
  findAll() {
    return this.userService.findAll();
  }

  @Get('view/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }


  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
