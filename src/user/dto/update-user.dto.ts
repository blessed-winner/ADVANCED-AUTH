import { IsEmail, IsString, MinLength } from "class-validator"

export class UpdateUserDto{
    @IsString()
    firstName:string

    @IsString()
    lastName:string

    @IsString()
    @IsEmail()
    email:string

    @IsString()
    @MinLength(6)
    password:string
}