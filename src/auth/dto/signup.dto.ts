import { IsEmail, IsString } from 'class-validator'
export class SignupDto{
   @IsString() 
   firstName:string

   @IsString()
   lastName:string

   @IsString()
   @IsEmail()
   email:string

   @IsString()
   password:string
}