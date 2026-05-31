import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '@src/module/blog/infrastructure/blog.repository';
import { UpdateBlogInputDto } from '@src/module/sa/api/input-dto/update-blog.input-dto';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: UpdateBlogInputDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogRepository: BlogRepository) {}

  async execute(command: UpdateBlogCommand): Promise<void> {
    const { id, dto } = command;

    const blog = await this.blogRepository.findById(id);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        extensions: [{ message: 'Blog not found', field: 'id' }],
      });
    }

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    await this.blogRepository.save(blog);
  }
}