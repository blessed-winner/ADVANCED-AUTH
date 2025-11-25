import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum Role { ADMIN = 'admin', USER = 'user' }

@Entity()
export class User {
   @PrimaryGeneratedColumn('uuid') 
   id:string

   @Column()
   firstName:string

   @Column()
   lastName:string

   @Column({unique:true})
   email:string

   @Column()
   password:string

   @Column({nullable:true})
   refreshToken?:string

   @Column({default:Role.USER})
   role:Role
}
