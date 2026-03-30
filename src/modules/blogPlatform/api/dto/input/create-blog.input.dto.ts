import { IsString, Matches } from 'class-validator';
import { isStringWithTrim } from '../../../../../core/decorators/validation/isStringWithTrim';

export class CreateBlogInputDto {
  @isStringWithTrim(1, 15)
  name: string;
  @isStringWithTrim(1, 500)
  description: string;

  @IsString()
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}
