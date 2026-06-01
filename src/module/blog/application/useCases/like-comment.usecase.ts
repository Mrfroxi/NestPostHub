import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '@src/module/blog/infrastructure/comment.repository';
import { CommentReactionRepository } from '@src/module/blog/infrastructure/comment-reaction.repository';
import CommentReaction from '@src/module/blog/domain/comment-reaction.entity';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import { LikeStatus } from '@src/module/blog/domain/comment-reaction.entity';

export class LikeCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: 'None' | 'Like' | 'Dislike',
  ) {}
}

@CommandHandler(LikeCommentCommand)
export class LikeCommentUseCase
  implements ICommandHandler<LikeCommentCommand>
{
  constructor(
    private commentRepository: CommentRepository,
    private commentReactionRepository: CommentReactionRepository,
  ) {}

  async execute(command: LikeCommentCommand): Promise<void> {
    const { commentId, userId, likeStatus } = command;

    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
        extensions: [{ message: 'comment not found', field: 'commentId' }],
      });
    }

    const existingReaction =
      await this.commentReactionRepository.findByCommentIdAndUserId(
        commentId,
        userId,
      );

    if (likeStatus === 'None') {
      if (existingReaction) {
        if (existingReaction.likeStatus === 'Like') {
          comment.likesCount--;
        } else {
          comment.dislikesCount--;
        }
        await this.commentReactionRepository.deleteById(existingReaction.id);
      }
    } else if (existingReaction) {

      if (existingReaction.likeStatus === likeStatus) {
        return;
      }
      if (existingReaction.likeStatus === 'Like') {
        comment.likesCount--;
      } else {
        comment.dislikesCount--;
      }
      if (likeStatus === 'Like') {
        comment.likesCount++;
      } else {
        comment.dislikesCount++;
      }
      existingReaction.likeStatus = likeStatus as LikeStatus;
      await this.commentReactionRepository.save(existingReaction);
    } else {
      if (likeStatus === 'Like') {
        comment.likesCount++;
      } else {
        comment.dislikesCount++;
      }
      const reaction = CommentReaction.create({
        commentId,
        userId,
        likeStatus: likeStatus as LikeStatus,
      });
      await this.commentReactionRepository.save(reaction);
    }

    await this.commentRepository.save(comment);
  }
}
