import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '@src/setup/config-validation.utility';

@Injectable()
export class NotificationConfig {
  constructor(private configService: ConfigService<any, true>) {
    this.smtpHost = this.configService.get('SMTP_HOST');
    this.smtpPort = Number(this.configService.get('SMTP_PORT'));
    this.smtpUser = this.configService.get('SMTP_USER');
    this.smtpPassword = this.configService.get('SMTP_PASSWORD');

    configValidationUtility.validateConfig(this);
  }

  @IsNotEmpty({ message: 'Set Env variable SMTP_HOST' })
  smtpHost: string;

  @IsNumber({}, { message: 'Set Env variable SMTP_PORT, example: 587' })
  smtpPort: number;

  @IsNotEmpty({ message: 'Set Env variable SMTP_USER' })
  smtpUser: string;

  @IsNotEmpty({ message: 'Set Env variable SMTP_PASSWORD' })
  smtpPassword: string;
}
