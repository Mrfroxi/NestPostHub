import { isStringWithTrim } from '../../../../../core/decorators/validation/isStringWithTrim';

export class CreatePostByBlogDto {
  @isStringWithTrim(1, 30)
  title: string;

  @isStringWithTrim(1, 100)
  shortDescription: string;

  @isStringWithTrim(1, 1000)
  content: string;
}
