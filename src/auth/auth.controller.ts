import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    private readonly authService: AuthService
  ) {}
    @Post('login')
    async login(
      @Body() loginDto:LoginDto){
       return this.authService.login(loginDto)
    }

    @Post('signup')
    async signUp(@Body() signupDto:SignupDto){
       return this.authService.signup(signupDto)
    }

    @Post('refresh')
    async refresh(@Body() refreshToken:string){
      
    }
  }
