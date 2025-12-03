import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class PasswordResetToken{
  @PrimaryGeneratedColumn('uuid')
  id:string

  @OneToOne(() => User,(user)=>user.passwordResetToken,{onDelete:'CASCADE'})
  @JoinColumn({name:"userId"})
  user:User

  @Column()
  token:string

  @Column()
  expiresAt:Date
}