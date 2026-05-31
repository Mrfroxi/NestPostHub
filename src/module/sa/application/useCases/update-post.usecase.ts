import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '@src/module/blog/infrastructure/post.repository';
import { BlogRepository } from '@src/module/blog/infrastructure/blog.repository';
import { UpdatePostInputDto } from '@src/module/sa/api/input-dto/update-post.input-dto';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class UpdatePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public dto: UpdatePostInputDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postRepository: PostRepository,
    private blogRepository: BlogRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const { blogId, postId, dto } = command;

    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        extensions: [{ message: 'Blog not found', field: 'blogId' }],
      });
    }

    const post = await this.postRepository.findById(postId);
    if (!post || post.blogId !== blogId) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ message: 'Post not found', field: 'postId' }],
      });
    }

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;

    await this.postRepository.save(post);
  }
}