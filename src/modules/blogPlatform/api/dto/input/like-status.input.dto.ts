import { IsEnum } from 'class-validator';

export enum LikeStatusInput {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export class LikeStatusInputDto {
  @IsEnum(LikeStatusInput)
  likeStatus: LikeStatusInput;
}
