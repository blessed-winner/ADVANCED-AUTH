import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'
import { Role } from '../entities/user.entity'
export class SignupDto{
   @IsString() 
   firstName:string

   @IsString()
   lastName:string

   @IsString()
   @IsEmail()
   email:string

   @IsString()
   @IsNotEmpty()
   @MinLength(6)
   password:string

   @IsOptional()
   @IsEnum(Role)
   role:Role
}