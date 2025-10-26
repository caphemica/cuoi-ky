import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService){}

    async sendVerificationEmail(name: string, email: string, verificationCode: number){
        await this.mailerService.sendMail({
            to: email,
            subject: 'Verify Your Email',
            template: 'verification',
            context: {
                fullName: name,
                verificationCode: verificationCode 
            }
        })

    }
}
