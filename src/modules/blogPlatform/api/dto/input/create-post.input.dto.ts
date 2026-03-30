import { isStringWithTrim } from '../../../../../core/decorators/validation/isStringWithTrim';
import { IsString } from 'class-validator';

export class CreatePostInputDto {
  @isStringWithTrim(1, 30)
  title: string;
  @isStringWithTrim(1, 100)
  shortDescription: string;
  @isStringWithTrim(1, 1000)
  content: string;
  @IsString()
  blogId: string;
}
