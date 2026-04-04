import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostByBlog } from '../../../domain/dto/create-post.dto';
import { BlogDocument } from '../../../domain/blog.entity';
import {
  Post,
  PostDocument,
  type PostModelType,
} from '../../../domain/post.entity';
import { BlogRepository } from '../../../infastructure/blog.repository';
import { PostRepository } from '../../../infastructure/post.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class CreatePostByBlogCommand {
  constructor(
    public blogId: string,
    public dto: CreatePostByBlog,
  ) {}
}

@CommandHandler(CreatePostByBlogCommand)
export class CreatePostByBlogUseCase implements ICommandHandler<
  CreatePostByBlogCommand,
  string
> {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private blogRepository: BlogRepository,
    private postRepository: PostRepository,
  ) {}

  async execute({ blogId, dto }: CreatePostByBlogCommand): Promise<string> {
    const blog: BlogDocument | null =
      await this.blogRepository.findOrNotFoundFail(blogId);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'blog not found', field: 'blog' }],
      });
    }

    const post: PostDocument = this.PostModel.createInstance({
      ...dto,
      blogId,
      blogName: blog.getName,
    });

    await this.postRepository.save(post);

    return post.getId;
  }
}
