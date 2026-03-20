import { IsEmail, IsString } from 'class-validator';

export class PasswordRecoveryInputDto {
  @IsString()
  @IsEmail()
  email: string;
}
