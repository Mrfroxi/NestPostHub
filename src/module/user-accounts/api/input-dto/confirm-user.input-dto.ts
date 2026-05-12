import { IsString } from 'class-validator';

export class ConfirmUserInputDto {
  @IsString()
  code: string;
}
