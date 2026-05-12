import { IsStringWithTrim } from '@core/decorators/validation/is-string-with-trim';
import { IsEmail, IsString, Matches } from 'class-validator';
import { Trim } from '@core/decorators/transform/trim';

export class CreateUserInputDto {
  @IsStringWithTrim(3, 10)
  @Matches('^[a-zA-Z0-9_-]*$')
  login: string;

  @IsStringWithTrim(6, 20)
  password: string;

  @IsString()
  @IsEmail()
  @Trim()
  email: string;
}
