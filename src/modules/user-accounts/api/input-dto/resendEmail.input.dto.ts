import { IsEmail, IsString } from 'class-validator';

export class ResendEmailInputDto {
  @IsString()
  @IsEmail()
  email: string;
}

export class ConfirmationCodeInputDto {
  @IsString()
  code: string;
}
