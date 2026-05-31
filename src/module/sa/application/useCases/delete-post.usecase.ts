import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '@src/module/blog/infrastructure/post.repository';
import { BlogRepository } from '@src/module/blog/infrastructure/blog.repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class DeletePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postRepository: PostRepository,
    private blogRepository: BlogRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const { blogId, postId } = command;

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

    await this.postRepository.deleteById(postId);
  }
}