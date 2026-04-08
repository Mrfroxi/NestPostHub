import { CommentDocument } from '../../../domain/comment.entity';

export class CommentOutputDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };

  static mapToOut(
    comment: CommentDocument,
    likesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: string;
    },
  ): CommentOutputDto {
    const dto = new this();
    dto.id = comment.getId;
    dto.content = comment.content;
    dto.commentatorInfo = comment.commentatorInfo;
    dto.createdAt = comment.createdAt;
    dto.likesInfo = likesInfo;

    return dto;
  }
}
