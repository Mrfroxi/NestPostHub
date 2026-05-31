import { IsString } from 'class-validator';

export class BlogIdParamDto {
  @IsString()
  id: string;
}