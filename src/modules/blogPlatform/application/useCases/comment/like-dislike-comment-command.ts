import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentLikeRepository } from '../../../infastructure/comment-like.repository';
import { CommentRepository } from '../../../infastructure/comment.repository';
import { UsersRepository } from '../../../../user-accounts/infastructure/users.repository';
import { LikeStatus } from '../../../domain/comment-like.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentDocument } from '../../../domain/comment.entity';

export class LikeDislikeCommentCommand {
  constructor(
    public commentId: string,
    public userLogin: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(LikeDislikeCommentCommand)
export class LikeDislikeCommentUseCase implements ICommandHandler<
  LikeDislikeCommentCommand,
  void
> {
  constructor(
    private commentLikeRepository: CommentLikeRepository,
    private commentRepository: CommentRepository,
    private usersRepository: UsersRepository,
  ) {}

  async validate(
    commentId: string,
    userLogin: string,
  ): Promise<{ userId: string; comment: CommentDocument }> {
    const user = await this.usersRepository.findByLogin(userLogin);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'User not found', field: 'userLogin' }],
      });
    }

    const comment: CommentDocument | null =
      await this.commentRepository.findOrNotFoundFail(commentId);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'Comment not found', field: 'comment' }],
      });
    }

    return { userId: user.getId, comment };
  }

  async execute({
    commentId,
    userLogin,
    likeStatus,
  }: LikeDislikeCommentCommand): Promise<void> {
    const { userId, comment } = await this.validate(commentId, userLogin);

    await this.commentLikeRepository.upsert(commentId, userId, likeStatus);

    const { likesCount, dislikesCount } =
      await this.commentLikeRepository.getLikesInfo(commentId);

    comment.likesCount = likesCount;
    comment.dislikesCount = dislikesCount;

    await this.commentRepository.save(comment);
  }
}
