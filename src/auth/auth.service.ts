import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { Role, User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo:Repository<User>,
    private config:ConfigService,
    private jwtService:JwtService
  ){}
 
  async signup(dto:SignupDto):Promise<{access_token:string}>{

      
      const hashed = await bcrypt.hash(dto.password,10)

      const exists = await this.userRepo.findOneBy({ email:dto.email })
      if(exists) throw new ConflictException("Email already in use")

      const user = this.userRepo.create({
        firstName:dto.firstName,
        lastName:dto.lastName,
        email:dto.email,
        password:hashed,
        role:dto.role
      })

     await this.userRepo.save(user)

    const access_token = await this.generateToken(user.id,user.email,user.role)
     if(!access_token) throw new InternalServerErrorException("Failed to generate access token")
     return { access_token }
     
  }
  

  private async generateToken(userId:string, email:string, role:Role){
      const accessPayload = { userId, email, role }
      const accessToken  = await this.jwtService.signAsync(accessPayload,{expiresIn: '1d'})
      return accessToken
  }

  async login(dto:LoginDto):Promise<{access_token:string}>{

      const user = await this.userRepo.findOneBy({ email:dto.email })
      if(!user) throw new NotFoundException("The user does not exist in the database")

      const isMatch = await bcrypt.compare(dto.password,user.password)
      if(!isMatch) throw new UnauthorizedException("Invalid credentials")

      const access_token = await this.generateToken(user.id,user.email,user.role)
      if(!access_token){
        throw new InternalServerErrorException("Failed to generate access token")
      }
      return { access_token }
  }
}
