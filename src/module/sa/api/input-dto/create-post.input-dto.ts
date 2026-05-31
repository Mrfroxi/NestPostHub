import { IsStringWithTrim } from '@src/core/decorators/validation/is-string-with-trim';

export class CreatePostInputDto {
  @IsStringWithTrim(1, 30)
  title: string;

  @IsStringWithTrim(1, 100)
  shortDescription: string;

  @IsStringWithTrim(1, 1000)
  content: string;
}