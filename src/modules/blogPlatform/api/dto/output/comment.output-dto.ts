import { CommentDocument } from '../../../domain/comment.entity';

export class CommentOutputDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;

  static mapToOut(comment: CommentDocument): CommentOutputDto {
    const dto = new this();
    dto.id = comment.getId;
    dto.content = comment.content;
    dto.commentatorInfo = comment.commentatorInfo;
    dto.createdAt = comment.createdAt;

    return dto;
  }
}
