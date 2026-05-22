import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { NotificationConfig } from '@src/module/notification/config/notification.config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private notificationConfig: NotificationConfig) {
    this.transporter = nodemailer.createTransport({
      host: this.notificationConfig.smtpHost,
      port: this.notificationConfig.smtpPort,
      secure: false,
      auth: {
        user: this.notificationConfig.smtpUser,
        pass: this.notificationConfig.smtpPassword,
      },
    });
  }

  async sendWelcomeEmail(
    email: string,
    login: string,
    confirmCode: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: this.notificationConfig.smtpUser,
      to: email,
      subject: 'Welcome to Blog Project!',
      html: ` <h1>Thank for your registration</h1>
               <p>To finish registration please follow the link below:<br>
                  <a href='http://localhost:5009/auth/registration-confirmation?code=${confirmCode}'>complete registration</a>
              </p>`,
    });
  }

  async sendRecoveryPasswordEmail(
    email: string,
    recoveryCode: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: this.notificationConfig.smtpUser,
      to: email,
      subject: 'Welcome to Blog Project!',
      html: `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='http://localhost:5009/auth/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
        </p>`,
    });
  }
}
