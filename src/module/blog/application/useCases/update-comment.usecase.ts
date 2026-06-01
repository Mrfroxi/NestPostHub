import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '@src/module/blog/infrastructure/comment.repository';
import { CreateCommentInputDto } from '@src/module/blog/api/input-dto/create-comment.input-dto';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public dto: CreateCommentInputDto,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(private commentRepository: CommentRepository) {}

  async execute(command: UpdateCommentCommand): Promise<void> {
    const { commentId, userId, dto } = command;

    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
        extensions: [{ message: 'comment not found', field: 'comment' }],
      });
    }

    if (comment.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Comment does not belong to user',
        extensions: [{ message: 'comment not found', field: 'userId' }],
      });
    }

    comment.content = dto.content;
    await this.commentRepository.save(comment);
  }
}
