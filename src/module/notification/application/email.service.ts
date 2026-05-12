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
      html: `<h1>Hello, ${login}!</h1><p>Your confirmation code: <b>${confirmCode}</b></p>`,
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
      html: `<h1>Hello!</h1><p>Your recoveryCode code: <b>${recoveryCode}</b></p>`,
    });
  }
}
