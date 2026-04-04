import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostDto } from '../../../domain/dto/update-post.dto';
import { PostDocument } from '../../../domain/post.entity';
import { PostRepository } from '../../../infastructure/post.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdatePostCommand {
  constructor(
    public id: string,
    public dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<
  UpdatePostCommand,
  string
> {
  constructor(private postRepository: PostRepository) {}

  async execute({ id, dto }: UpdatePostCommand): Promise<string> {
    const post: PostDocument | null =
      await this.postRepository.findOrNotFoundFail(id);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'post not found', field: 'post' }],
      });
    }

    post.update(dto);

    await this.postRepository.save(post);

    return post.getId;
  }
}
