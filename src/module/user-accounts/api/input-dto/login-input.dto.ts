import { IsString, Length } from 'class-validator';

export class LoginInputDto {
  @Length(6, 20)
  password: string;

  @IsString()
  loginOrEmail: string;
}
