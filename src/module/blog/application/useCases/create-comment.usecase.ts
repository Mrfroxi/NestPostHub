import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '@src/module/blog/infrastructure/comment.repository';
import { PostRepository } from '@src/module/blog/infrastructure/post.repository';
import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
import { CreateCommentInputDto } from '@src/module/blog/api/input-dto/create-comment.input-dto';
import Comment from '@src/module/blog/domain/comment.entity';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public userId: string,
    public dto: CreateCommentInputDto,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private commentRepository: CommentRepository,
    private postRepository: PostRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<string> {
    const { postId, userId, dto } = command;

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ message: 'Post not found', field: 'postId' }],
      });
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'User not found',
        extensions: [{ message: 'User not found', field: 'userId' }],
      });
    }

    const comment = Comment.create({
      content: dto.content,
      userId,
      userLogin: user.login,
      postId,
    });

    const saved = await this.commentRepository.save(comment);
    return saved.id;
  }
}
