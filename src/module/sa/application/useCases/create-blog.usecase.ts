import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '@src/module/blog/infrastructure/blog.repository';
import Blog from '@src/module/blog/domain/blog.entity';
import { CreateBlogInputDto } from '@src/module/sa/api/input-dto/create-blog.input-dto';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogRepository: BlogRepository) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const { dto } = command;

    const blog = Blog.create({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    const savedBlog = await this.blogRepository.save(blog);
    return savedBlog.id;
  }
}