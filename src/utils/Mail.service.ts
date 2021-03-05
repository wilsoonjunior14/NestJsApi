import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {

    constructor(private readonly mailService: MailerService){
    }

    public async sendExample() : Promise<void> {
        return await this.mailService.sendMail({
            from: "noreply@gmail.com",
            to: "wjunior_msn@hotmail.com",
            subject: "Subject example",
            template: __dirname + "/templates/welcome.ejs",
            context: {
                code: "12345",
                username: 'john dagget'
            }
        });
    }
    
    public async sendRecoveryPasswordMail(user: any) : Promise<void> {
        return await this.mailService.sendMail({
            from: "noreply@gmail.com",
            to: user.email,
            subject: "Recuperação de Senha",
            template: __dirname + "/templates/recovery_password.ejs",
            context: {
                verificationCode: user.verificationCode,
                name: user.name,
                system: "NestJs App"
            }
        });
    }

}