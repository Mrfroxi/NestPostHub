import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '@src/setup/config-validation.utility';

@Injectable()
export class UserAccountsConfig {
  constructor(private configService: ConfigService<any, true>) {
    this.accessTokenExpireIn = this.configService.get('ACCESS_TOKEN_EXPIRE_IN');
    this.refreshTokenExpireIn = this.configService.get(
      'REFRESH_TOKEN_EXPIRE_IN',
    );

    this.accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');
    this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');

    this.adminLogin = this.configService.get('ADMIN_USER');
    this.adminPassword = this.configService.get('ADMIN_PASSWORD');

    configValidationUtility.validateConfig(this);
  }

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  accessTokenExpireIn: string;

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  refreshTokenExpireIn: string;

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret: string;

  @IsNotEmpty({
    message: 'adminLogin',
  })
  adminLogin: string;

  @IsNotEmpty({
    message: 'adminPassword',
  })
  adminPassword: string;
}
