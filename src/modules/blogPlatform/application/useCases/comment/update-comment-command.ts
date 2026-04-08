import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../../../infastructure/comment.repository';
import { UsersRepository } from '../../../../user-accounts/infastructure/users.repository';
import { UpdateCommentInputDto } from '../../../api/dto/input/update-comment.input.dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentDocument } from '../../../domain/comment.entity';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public userLogin: string,
    public dto: UpdateCommentInputDto,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<
  UpdateCommentCommand,
  void
> {
  constructor(
    private commentRepository: CommentRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    commentId,
    userLogin,
    dto,
  }: UpdateCommentCommand): Promise<void> {
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
            message: 'You cannot edit another user comment',
            field: 'commentId',
          },
        ],
      });
    }

    comment.updateContent(dto.content);
    await this.commentRepository.save(comment);
  }
}
