import { IsStringWithTrim } from '@src/core/decorators/validation/is-string-with-trim';
import { IsString, Length, Matches } from 'class-validator';

export class CreateBlogInputDto {
  @IsStringWithTrim(1, 15)
  name: string;

  @IsStringWithTrim(1, 500)
  description: string;

  @IsString()
  @Length(1, 100)
  @Matches(/^https?:\/\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.[a-zA-Z0-9._-]+[a-zA-Z0-9](\/[a-zA-Z0-9._-]*)*$/)
  websiteUrl: string;
}