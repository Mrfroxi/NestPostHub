import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '@src/setup/config-validation.utility';

@Injectable()
export class SaConfig {
  constructor(private configService: ConfigService<any, true>) {
    this.adminLogin = this.configService.get('ADMIN_USER');
    this.adminPassword = this.configService.get('ADMIN_PASSWORD');

    configValidationUtility.validateConfig(this);
  }

  @IsNotEmpty({
    message: 'adminLogin',
  })
  adminLogin: string;

  @IsNotEmpty({
    message: 'adminPassword',
  })
  adminPassword: string;
}