import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    private readonly authService: AuthService
  ) {}
    @Post('login')
    async login(
      @Body() loginDto:LoginDto,
      @Res({passthrough:true}) res:Response
    ){
       const result = await this.authService.login(loginDto)
       res.cookie('Refresh_token',result.tokens.refreshToken,{
        maxAge:7 * 24 * 60 * 60 * 1000, 
        httpOnly:true, 
        sameSite:'strict'
      })

      return result
    }

    @Post('signup')
    async signUp(
      @Body() signupDto:SignupDto,
      @Res({passthrough:true}) res:Response
    ){
       const result = await this.authService.signup(signupDto)
      res.cookie('Refresh_token',result.tokens.refreshToken,{
        maxAge:7 * 24 * 60 * 60 * 1000, 
        httpOnly:true, 
        sameSite:'strict'
      })
       return result
    }

    @Post('refresh')
    async refresh(
      @Res({passthrough:true}) res:Response,
      @Req() req:Request
    ){
      const refreshToken = req.cookies['Refresh_token']
      const result = await this.authService.refresh(refreshToken)
      res.cookie('Refresh_token',result.tokens.refreshToken,{ 
        maxAge:7*24*60*60*1000, 
        httpOnly:true, 
        sameSite:'strict' 
      })
      return result
  }
  }
