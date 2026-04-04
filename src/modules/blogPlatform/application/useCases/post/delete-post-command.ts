import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostDocument } from '../../../domain/post.entity';
import { PostRepository } from '../../../infastructure/post.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeletePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<
  DeletePostCommand,
  void
> {
  constructor(private postRepository: PostRepository) {}

  async execute({ id }: DeletePostCommand): Promise<void> {
    const post: PostDocument | null =
      await this.postRepository.findOrNotFoundFail(id);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'post not found', field: 'post' }],
      });
    }

    post.makeDeleted();

    await this.postRepository.save(post);
  }
}
