import { IsString } from 'class-validator';
import { isStringWithTrim } from '../../../../core/decorators/validation/isStringWithTrim';

export class NewPasswordInputDto {
  @isStringWithTrim(6, 20)
  newPassword: string;

  @IsString()
  recoveryCode: string;
}
