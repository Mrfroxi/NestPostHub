import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLikeRepository } from '../../../infastructure/post-like.repository';
import { UsersRepository } from '../../../../user-accounts/infastructure/users.repository';
import { LikeStatus } from '../../../domain/post-like.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostRepository } from '../../../infastructure/post.repository';
import { PostDocument } from '../../../domain/post.entity';

export class LikeDislikePostCommand {
  constructor(
    public postId: string,
    public userLogin: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(LikeDislikePostCommand)
export class LikeDislikePostUseCase implements ICommandHandler<
  LikeDislikePostCommand,
  void
> {
  constructor(
    private postLikeRepository: PostLikeRepository,
    private usersRepository: UsersRepository,
    private postRepository: PostRepository,
  ) {}

  async validate(
    postId: string,
    userLogin: string,
  ): Promise<{ userId: string; post: PostDocument }> {
    const user = await this.usersRepository.findByLogin(userLogin);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'User not found', field: 'userLogin' }],
      });
    }

    const post: PostDocument | null =
      await this.postRepository.findOrNotFoundFail(postId);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'Post not found', field: 'post' }],
      });
    }

    return { userId: user.getId, post };
  }

  async execute({
    postId,
    userLogin,
    likeStatus,
  }: LikeDislikePostCommand): Promise<void> {
    const { userId, post } = await this.validate(postId, userLogin);

    await this.postLikeRepository.upsert(postId, userId, likeStatus);

    const { likesCount, dislikesCount } =
      await this.postLikeRepository.getLikesInfo(postId);

    post.setLikes(likesCount);
    post.setDisLikes(dislikesCount);

    await this.postRepository.save(post);
  }
}
