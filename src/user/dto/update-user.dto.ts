import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsString, MinLength } from "class-validator"

export class UpdateUserDto{
    @ApiProperty({example:"John", description:"User first name"})
    @IsString()
    firstName:string

    @ApiProperty({example:"Doe", description:"User Last name"})
    @IsString()
    lastName:string

    @ApiProperty({example:"john.doe@gmail.com", description:"User email"})
    @IsString()
    @IsEmail()
    email:string

    @ApiProperty({example:"strongPass123", description:"User password"})
    @IsString()
    @MinLength(6)
    password:string
}