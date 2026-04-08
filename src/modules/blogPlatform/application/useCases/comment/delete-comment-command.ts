import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../../../infastructure/comment.repository';
import { UsersRepository } from '../../../../user-accounts/infastructure/users.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentDocument } from '../../../domain/comment.entity';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userLogin: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<
  DeleteCommentCommand,
  void
> {
  constructor(
    private commentRepository: CommentRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    commentId,
    userLogin,
  }: DeleteCommentCommand): Promise<void> {
    const user = await this.usersRepository.findByLogin(userLogin);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'User not found', field: 'userLogin' }],
      });
    }

    const comment: CommentDocument =
      await this.commentRepository.findOrNotFoundFail(commentId);

    if (comment.commentatorInfo.userId !== user.getId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        extensions: [
          {
            message: 'You cannot delete another user comment',
            field: 'commentId',
          },
        ],
      });
    }

    comment.makeDeleted();
    await this.commentRepository.save(comment);
  }
}
