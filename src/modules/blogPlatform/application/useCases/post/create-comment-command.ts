import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCommentByPostDto } from '../../../domain/dto/create-comment.dto';
import {
  Comment,
  CommentDocument,
  type CommentModelType,
} from '../../../domain/comment.entity';
import { CommentRepository } from '../../../infastructure/comment.repository';
import { PostRepository } from '../../../infastructure/post.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public dto: CreateCommentByPostDto,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<
  CreateCommentCommand,
  string
> {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private commentRepository: CommentRepository,
    private postRepository: PostRepository,
  ) {}

  async execute({ postId, dto }: CreateCommentCommand): Promise<string> {
    const isPost = await this.postRepository.findOrNotFoundFail(postId);

    if (!isPost) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'post not found', field: 'isPost' }],
      });
    }

    const comment: CommentDocument = this.CommentModel.createInstance({
      postId,
      ...dto,
    });

    await this.commentRepository.save(comment);

    return comment.getId;
  }
}
