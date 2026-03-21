import { IsString } from 'class-validator';
import { isStringWithTrim } from '../../../../core/decorators/validation/isStringWithTrim';

export class LoginInputDto {
  @isStringWithTrim(3, 30)
  loginOrEmail: string;

  @isStringWithTrim(6, 20)
  password: string;
}
