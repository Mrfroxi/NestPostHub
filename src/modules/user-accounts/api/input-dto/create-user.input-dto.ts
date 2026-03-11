import { IsEmail, IsString } from 'class-validator';
import { isStringWithTrim } from '../../../../core/decorators/validation/isStringWithTrim';

export class CreateUserInputDto {
  @isStringWithTrim(3, 30)
  login: string;

  @IsString()
  @IsEmail()
  email: string;

  @isStringWithTrim(6, 20)
  password: string;
}
