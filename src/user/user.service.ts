import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepo:Repository<User>,
  ){}


  async findAll():Promise<User[]> {
      const users = await this.userRepo.find()
      return users
  }

  async findOne(id: string):Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } })
    if(!user){
      throw new NotFoundException("User not found")
    }
    return user
  }

  async remove(id: string) {
    const deleteUser = await this.userRepo.delete(id)
    if(deleteUser.affected === 0 ){
       throw new NotFoundException("User not found")
    }
  }

  async getProfile(id:string):Promise<User>{
    const user = await this.userRepo.findOne(
      { 
      where: { id }, 
      select: {
        firstName: true,
        lastName: true,
        email:true,
        refreshToken:true
      } 
    })
    if(!user){
      throw new NotFoundException(`User with id ${id} not found`)
    }

    return user
    
  }

     async updateProfile(id: string, dto: UpdateUserDto): Promise<User> {
       const user = await this.userRepo.findOne({ where: { id } });
       if (!user) {
         throw new NotFoundException("User not found");
       }

       if (dto.password) {
         user.password = await bcrypt.hash(dto.password, 10);
       }

       user.firstName = dto.firstName ?? user.firstName;
       user.lastName = dto.lastName ?? user.lastName;
       user.email = dto.email ?? user.email;

       const savedUser = await this.userRepo.save(user);

       return savedUser;
     }

}
