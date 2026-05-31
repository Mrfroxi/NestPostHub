import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '@src/module/blog/infrastructure/blog.repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogRepository: BlogRepository) {}

  async execute(command: DeleteBlogCommand): Promise<void> {
    const { id } = command;

    const blog = await this.blogRepository.findById(id);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        extensions: [{ message: 'Blog not found', field: 'id' }],
      });
    }

    await this.blogRepository.deleteById(id);
  }
}