import { IsMongoId } from 'class-validator';

export class postParamId {
  @IsMongoId()
  postId: string;
}

export class commentParamId {
  @IsMongoId()
  commentId: string;
}
