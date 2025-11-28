import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "src/auth/auth.service";
import { Role } from "src/auth/entities/user.entity";

export type JwtPayload = {
  sub:string,
  email:string,
  role:Role
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt'){
  constructor(
    config:ConfigService,
    private authService:AuthService
  ){
    super({
       jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
       secretOrKey:config.getOrThrow<string>('JWT_SECRET')
    })
  }

  async validate(payload:JwtPayload){
     const user = await this.authService.validateUserById(payload.sub)
     if(!user){
      throw new UnauthorizedException("Invalid token")
     }

     return user
  }
}