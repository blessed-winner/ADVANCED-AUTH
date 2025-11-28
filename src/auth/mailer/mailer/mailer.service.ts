import * as path from 'path'
import * as ejs from 'ejs'
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter } from 'nodemailer'
import { SMTPTransport } from 'nodemailer/lib/smtp-transport'

const nodemailer = require('nodemailer')

@Injectable()
export class MailerService implements OnModuleInit {
    private transporter:Transporter<SMTPTransport.SentMessageInfo>

    constructor(private config:ConfigService){}
    async onModuleInit() {
        await this.initTransporter()
    }

    private async initTransporter(){
         this.transporter = nodemailer.createTransport({
            host:this.config.get<string>('MAIL_HOST'),
            port:Number(this.config.get<string>('SMTP_PORT')),
            secure:false,
            auth:{
                user:this.config.get<string>('SMTP_USERNAME'),
                pass:this.config.get<string>('SMTP_PASSWORD')
            }
         } as SMTPTransport.Options)
    }

    async sendVerificationEmail(to:string,token:string,name:string){
        try{
        const verificationUrl = `http://localhost:3000/auth/verify-user?token=${token}`
        const templatePath =  path.join(process.cwd(),"src","auth","mailer","templates","verify-email.ejs")
        const htmlContent = await ejs.renderFile(templatePath,{verificationUrl,name})

        const info = await this.transporter.sendMail({
            from: '"Advanced-auth" <noreply@advanced-auth.test>',
            to,
            subject: "Email verification",
            html:htmlContent
        })

        console.log(`Verification email sent to ${to}` )
        } catch(error){
           console.error('An error occured', error)
        }
      
    }
}
