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
 
  async signup(dto:SignupDto):Promise<{user:User,tokens:{accessToken:string,refreshToken:string}}>{

      
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

     const tokens = await this.generateTokens(user)
     return {user,tokens}
     
  }
  

  private async generateTokens(user:User):Promise<{accessToken:string,refreshToken:string}>{
      const payload = { userId:user.id,email:user.email,role:user.role}
      const accessToken  = await this.jwtService.signAsync(payload,{expiresIn:'1d'})

      const refreshToken = await this.jwtService.signAsync(payload, 
      {expiresIn:'7d'})
      user!.refreshToken = await bcrypt.hash(refreshToken,10)
      await this.userRepo.save(user)

      return { accessToken,refreshToken }
  }

  async login(dto:LoginDto):Promise<{user:User,tokens:{accessToken:string,refreshToken:string}}>{

      const user = await this.userRepo.findOneBy({ email:dto.email.toLowerCase().trim()})
      if(!user) throw new NotFoundException("The user does not exist in the database")

      const isMatch = await bcrypt.compare(dto.password,user.password)
      if(!isMatch) throw new UnauthorizedException("Invalid credentials")

      const tokens = await this.generateTokens(user)
      return { user,tokens }
  }

  async refresh(token:string):Promise<{user:User,tokens:{accessToken, refreshToken}}>{
    const user = await this.userRepo.findOneBy({refreshToken:token})
    if(!user || !user.refreshToken) throw new UnauthorizedException("Invalid refresh token")
    const isMatch = await bcrypt.compare(token,user.refreshToken)
    if(!isMatch) throw new UnauthorizedException("Invalid refresh token")

    const tokens = await this.generateTokens(user)
    return { user, tokens }  
  }
}
