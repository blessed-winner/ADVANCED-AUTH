import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { Role, User } from './entities/user.entity';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
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
      const email = dto.email.toLowerCase().trim()

      const exists = await this.userRepo.findOneBy({ email })
      if(exists) throw new ConflictException("Email already in use")

      const user = this.userRepo.create({
        firstName:dto.firstName.trim(),
        lastName:dto.lastName.trim(),
        email,
        password:hashed,
        role:Role.USER
      })

      try {
        await this.userRepo.save(user)
      } catch (error) {
        throw new InternalServerErrorException("Problem creating user")
      }
     
    const access_token = await this.generateToken(user.id,user.email,user.role)
     return { access_token }
     
  }
  

  private async generateToken(userId:string, email:string, role:Role):Promise<string>{
      const accessPayload = { userId, email, role }
      const accessToken  = await this.jwtService.signAsync(accessPayload,{expiresIn:'1d'})
      return accessToken
  }

  async login(dto:LoginDto):Promise<{access_token:string}>{

      const user = await this.userRepo.findOneBy({ email:dto.email.toLowerCase().trim()})
      if(!user) throw new NotFoundException("The user does not exist in the database")

      const isMatch = await bcrypt.compare(dto.password,user.password)
      if(!isMatch) throw new UnauthorizedException("Invalid credentials")

      const access_token = await this.generateToken(user.id,user.email,user.role)
      return { access_token }
  }
}
