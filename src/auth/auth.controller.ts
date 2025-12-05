import { Body, Controller, Get, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../user/user.controller'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
   private readonly authService: AuthService
  ) {}
    @Post('login')
    @ApiOperation({ summary: 'Login user with email and password' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 201, description: 'User logged in and tokens issued' })
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
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: SignupDto })
    @ApiResponse({ status: 201, description: 'User created and tokens issued' })
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
    @ApiOperation({ summary: 'Refresh access token using refresh cookie' })
    @ApiCookieAuth('Refresh_token')
    @ApiResponse({ status: 200, description: 'New tokens issued and refresh cookie updated' })
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

  @Post('verify-user')
  @ApiOperation({ summary: 'Verify user email using token' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  async verify(
    @Query('token') token:string
  ){
    return this.authService.verifyEmail(token)
  }

  @Post('request-reset')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status:200, description:'Password reset request validated' })
  async requestReset(
    @Req() req:AuthenticatedRequest
  ){
     const userId = req?.user?.id
     if(!userId) throw new UnauthorizedException("Cannot get authenticated user")
     return await this.authService.requestPasswordReset(userId)
  }

  @Get('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status:200, description:'Password reset successful' })
  async resetPassword(
    @Query('token') token:string,
    @Body() newPassword:string
  ){
    return await this.authService.resetPassword(token,newPassword)
  }
  }
