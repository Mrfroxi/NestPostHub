import { IsEnum } from 'class-validator';

export enum CommentLikeStatusInput {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export class CommentLikeStatusInputDto {
  @IsEnum(CommentLikeStatusInput)
  likeStatus: CommentLikeStatusInput;
}
