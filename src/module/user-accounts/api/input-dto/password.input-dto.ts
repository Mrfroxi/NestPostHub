import { IsEmail, IsString, Length } from 'class-validator';
import { Trim } from '@core/decorators/transform/trim';

export class PasswordInputDto {
  @Length(6, 20)
  newPassword: string;

  @IsString()
  recoveryCode: string;
}

export class PasswordRecoveryDto {
  @IsString()
  @IsEmail()
  @Trim()
  email: string;
}
