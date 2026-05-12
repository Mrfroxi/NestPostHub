import { Injectable } from '@nestjs/common';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '@src/setup/config-validation.utility';

@Injectable()
export class CoreConfig {
  constructor(private configService: ConfigService<any, true>) {
    this.port = Number(this.configService.get('PORT'));
    this.host = this.configService.get('DB_HOST');
    this.dbPort = Number(this.configService.get('DB_PORT'));
    this.username = this.configService.get('DB_USERNAME');
    this.password = this.configService.get('DB_PASSWORD');
    this.dbName = this.configService.get('DB_DATABASE');

    this.sendInternalServerErrorDetails =
      configValidationUtility.convertToBoolean(
        this.configService.get('SEND_INTERNAL_SERVER_ERROR_DETAILS'),
      ) as boolean;

    configValidationUtility.validateConfig(this);
  }

  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3000',
    },
  )
  port: number;

  @IsNumber(
    {},
    {
      message: 'Set Env variable DB_PORT, example: 5432',
    },
  )
  dbPort: number;

  @IsNotEmpty({
    message: 'Set Env variable DB_HOST, example: localhost:27017',
  })
  host: string;

  @IsNotEmpty({
    message: 'Set Env variable DB_USERNAME, example: username',
  })
  username: string;

  @IsNotEmpty({
    message: 'Set Env variable DB_PASSWORD, example: 123',
  })
  password: string;

  @IsNotEmpty({
    message: 'Set Env variable DB_DATABASE, example: blog-project',
  })
  dbName: string;

  @IsBoolean({
    message:
      'Set Env variable SEND_INTERNAL_SERVER_ERROR_DETAILS to enable/disable Dangerous for production internal server error details (message, etc), example: true, available values: true, false, 0, 1',
  })
  sendInternalServerErrorDetails: boolean;
}
