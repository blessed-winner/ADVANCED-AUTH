import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { Role, User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo:Repository<User>,
    private config:ConfigService,
    private jwtService:JwtService
  ){}
 
  async signup(dto:SignupDto):Promise<{access_token:string}>{
      const user = this.userRepo.create({
        firstName:dto.firstName,
        lastName:dto.lastName,
        email:dto.email,
        password:dto.password,
        role:dto.role
      })
 
     if(!user){
      throw new InternalServerErrorException("Signup failed") 
     }

     const access_token = await this.generateToken(user.id,user.email,user.role)
     if(!access_token) throw new InternalServerErrorException("Failed to generate access token")
     return { access_token }
     
  }

  private async generateToken(userId:string, email:string, role:Role){
      const accessPayload = { userId, email, role }
      const accessSecret = this.config.get<string>('JWT_SECRET')
      if(!accessSecret){
         throw new InternalServerErrorException("Access Secret is not defined")
      }
      const accessToken  = await this.jwtService.signAsync(accessPayload,{ 
        secret:this.config.get<string>('JWT_SECRET'),
        expiresIn: '1d'
      })

      return accessToken
  }

  async login(dto:LoginDto):Promise<{access_token:string}>{
      const user = await this.userRepo.findOneBy({ email:dto.email })
      if(!user) throw new NotFoundException("The user does not exist in the database")
      const access_token = await this.generateToken(user.id,user.email,user.role)
      if(!access_token){
        throw new InternalServerErrorException("Failed to generate access token")
      }
      return { access_token }
  }
}
