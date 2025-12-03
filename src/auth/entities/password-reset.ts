import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class PasswordResetToken{
  @PrimaryGeneratedColumn('uuid')
  id:string

  @OneToOne(() => User)
  @JoinColumn()
  user:User

  @Column()
  token:string

  @Column()
  expiresAt:Date
}