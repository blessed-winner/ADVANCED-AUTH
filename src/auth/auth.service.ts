import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';


@Injectable()
export class AuthService {
 
  async signup(dto:LoginDto){
      
  }

  async login(dto:SignupDto){
     
  }
}
