import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { emailExamples } from '../../core/helpers/email-template';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: `How to Send Emails with Nodemailer`,
      text: emailExamples.registrationEmail(code),
    });
  }

  async sendRecoveryPassword(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: `How to Send Emails with Nodemailer`,
      text: emailExamples.passwordRecoveryEmail(code),
    });
  }
}
