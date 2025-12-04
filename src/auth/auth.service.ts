import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { Role, User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { MailerService } from './mailer/mailer.service';
import { JwtPayload } from 'src/utils/Strategies/jwt-access.strategy';
import { TokenService } from 'src/utils/token/token.service';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo:Repository<User>,
    private config:ConfigService,
    private jwtService:JwtService,
    private readonly mailerService:MailerService,
    private tokenService:TokenService
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
     await this.mailerService.sendVerificationEmail("blessedwinner66@gmail.com",tokens.accessToken,(user.firstName + " " + user.lastName))

     return {user,tokens}
     
  }
  

  private async generateTokens(user:User):Promise<{accessToken:string,refreshToken:string}>{
      const payload = { sub:user.id,email:user.email,role:user.role}
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

      if(!user.isEmailVerified){
        throw new UnauthorizedException()
      }

      const isMatch = await bcrypt.compare(dto.password,user.password)
      if(!isMatch) throw new UnauthorizedException("Invalid credentials")

      const tokens = await this.generateTokens(user)
      return { user,tokens }
  }

  async refresh(token:string):Promise<{user:User,tokens:{accessToken:string, refreshToken:string}}>{
    let payload: { sub:string, email:string, role:Role }

     try{
       payload = await this.jwtService.verifyAsync(token,{ secret: this.config.get<string>('JWT_REFRESH_SECRET') })
     }catch(err){
       throw new UnauthorizedException('Invalid or expired refresh token')
     }
    
    const user = await this.userRepo.findOneBy({id:payload.sub})
    if(!user || !user.refreshToken) throw new UnauthorizedException("Invalid refresh token")
    const isMatch = await bcrypt.compare(token,user.refreshToken)
    if(!isMatch) throw new UnauthorizedException("Invalid refresh token")

    const tokens = await this.generateTokens(user)
    return { user, tokens }  
  }

  async validateUserById(id:string){
     const user = await this.userRepo.findOne({ where:{ id } })
     if(!user) return null
     return user
  }

  async verifyEmail(token:string){
    try {
      const payload = await this.jwtService.verifyAsync(token)
      const user = await this.userRepo.findOne({ where: { email:payload.email } })
      if(!user){
        throw new BadRequestException("User not found")
      }

      if(user.isEmailVerified) return { message:"User already verified" }

      user.isEmailVerified = true

      await this.userRepo.save(user)
      
      return { message:"User verified successfully" }
    } catch (e){
       throw new BadRequestException("Invalid or expired token")
    }
  }

  async getUserIfRefreshTokenMatches(token:string){
      const refreshToken = await this.jwtService.verifyAsync(token)


      const user = await this.userRepo.findOneBy({refreshToken})

      if(!user || !user.refreshToken) return null

      return user
  }

  async requestPasswordReset(userId:string){
     const user = await this.userRepo.findOne({ where: { id:userId } })
     if(!user){
       throw new NotFoundException("User not found")
     }
     const token = this.tokenService.generateRandomToken()

     await this.tokenService.saveToken(token,userId,"10")
  }

  async resetPassword(token:string,newPassword:string){
      const record = await this.tokenService.validateToken(token)
      if(!record){
        throw new NotFoundException("Token expired or unmatching")
      }

  }
}
