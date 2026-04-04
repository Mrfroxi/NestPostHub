import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogDocument } from '../../../domain/blog.entity';
import { BlogRepository } from '../../../infastructure/blog.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<
  DeleteBlogCommand,
  void
> {
  constructor(private blogRepository: BlogRepository) {}

  async execute({ id }: DeleteBlogCommand): Promise<void> {
    const blog: BlogDocument | null =
      await this.blogRepository.findOrNotFoundFail(id);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'blog not found', field: 'blog' }],
      });
    }

    blog.makeDeleted();

    await this.blogRepository.save(blog);
  }
}
