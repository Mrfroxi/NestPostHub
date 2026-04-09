import { IsString, Length, Matches } from 'class-validator';
import { isStringWithTrim } from '../../../../core/decorators/validation/isStringWithTrim';

export class UpdateBlogDto {
  @isStringWithTrim(1, 15)
  name: string;
  @isStringWithTrim(1, 500)
  description: string;

  @IsString()
  @Length(1, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}
