import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '@src/module/blog/infrastructure/comment.repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentRepository: CommentRepository) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const { commentId, userId } = command;

    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    if (comment.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Comment does not belong to user',
      });
    }

    await this.commentRepository.deleteById(commentId);
  }
}
