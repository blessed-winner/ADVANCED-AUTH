import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto'
import { PasswordResetToken } from 'src/auth/entities/password-reset';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(PasswordResetToken)
        private resetRepo:Repository<PasswordResetToken>
    ){}
   generateRandomToken(length:number=32):string{
      return crypto.randomBytes(length).toString('hex')
   }

   async validateToken(token:string):Promise<{userId:string} | null>{
       const record = await this.resetRepo.findOne({ 
         where:{ token },
         relations: [ "user" ] 
      })
       if(!record) return null
       if(record.expiresAt < new Date()){
        await this.deleteToken(token)
        return null
       }

       return {userId:record.user.id}
   }

   async saveToken(token:string,userId:string,expiresInSeconds:string){
      const expiresAt = new Date(Date.now() + Number(expiresInSeconds) * 1000)
      const newToken = this.resetRepo.create({
         user:{
            id:userId
         },
         token,
         expiresAt
      })

      return await this.resetRepo.save(newToken)
   }

   async deleteToken(token:string){
    await this.resetRepo.delete(token)
   }

}
