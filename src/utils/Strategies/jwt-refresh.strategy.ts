import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy } from "passport-jwt";
import { JwtPayload } from "./jwt-access.strategy";
import { AuthService } from "src/auth/auth.service";
import { UnauthorizedException } from "@nestjs/common";
import { User } from "src/auth/entities/user.entity";

export class RefreshTokenStrategy extends PassportStrategy(Strategy,'jwt-strategy'){
   constructor(
    config:ConfigService,
    private authService:AuthService
   ){
     super({
        jwtFromRequest:(req:Request) => {
           return req?.body?.refreshToken || req?.cookies?.refreshToken
        },
        secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        passReqToCallback:true
     })
   }

   async validate(req:Request, payload:JwtPayload):Promise<User>{
       const refreshToken = req?.body?.refreshToken || req?.cookies?.refreshToken
       
       const user = await this.authService.getUserIfRefreshTokenMatches(refreshToken)

       if(!user){
        throw new UnauthorizedException("Invalid refresh token")
       }

       return user
   }
}