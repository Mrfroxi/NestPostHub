import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '@src/module/blog/infrastructure/post.repository';
import { BlogRepository } from '@src/module/blog/infrastructure/blog.repository';
import { CreatePostInputDto } from '@src/module/sa/api/input-dto/create-post.input-dto';
import Post from '@src/module/blog/domain/post.entity';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class CreatePostCommand {
  constructor(
    public blogId: string,
    public dto: CreatePostInputDto,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postRepository: PostRepository,
    private blogRepository: BlogRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const { blogId, dto } = command;

    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        extensions: [{ message: 'Blog not found', field: 'blogId' }],
      });
    }

    const post = Post.create({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId,
      blogName: blog.name,
    });

    const savedPost = await this.postRepository.save(post);
    return savedPost.id;
  }
}