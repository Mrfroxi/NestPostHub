import { IsString, Length } from 'class-validator';

export interface CreateCommentDto extends CreateCommentByPostDto {
  postId: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
}

export interface CreateCommentByPostDto {
  content: string;
}

export class CreateCommentPostDto {
  @IsString()
  @Length(20, 300)
  content: string;
}
