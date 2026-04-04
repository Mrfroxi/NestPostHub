import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../../../domain/dto/update-blog.dto';
import { BlogDocument } from '../../../domain/blog.entity';
import { BlogRepository } from '../../../infastructure/blog.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<
  UpdateBlogCommand,
  string
> {
  constructor(private blogRepository: BlogRepository) {}

  async execute({ id, dto }: UpdateBlogCommand): Promise<string> {
    const blog: BlogDocument | null =
      await this.blogRepository.findOrNotFoundFail(id);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'blog not found', field: 'blog' }],
      });
    }

    blog.update(dto);

    await this.blogRepository.save(blog);

    return blog.getId;
  }
}
