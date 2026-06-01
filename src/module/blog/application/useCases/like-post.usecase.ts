import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '@src/module/blog/infrastructure/post.repository';
import { PostReactionRepository } from '@src/module/blog/infrastructure/post-reaction.repository';
import PostReaction from '@src/module/blog/domain/post-reaction.entity';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import { LikeStatus } from '@src/module/blog/domain/post-reaction.entity';

export class LikePostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: 'None' | 'Like' | 'Dislike',
  ) {}
}

@CommandHandler(LikePostCommand)
export class LikePostUseCase implements ICommandHandler<LikePostCommand> {
  constructor(
    private postRepository: PostRepository,
    private postReactionRepository: PostReactionRepository,
  ) {}

  async execute(command: LikePostCommand): Promise<void> {
    const { postId, userId, likeStatus } = command;

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    const existingReaction =
      await this.postReactionRepository.findByPostIdAndUserId(postId, userId);

    if (likeStatus === 'None') {
      if (existingReaction) {
        if (existingReaction.likeStatus === 'Like') {
          post.likesCount--;
        } else {
          post.dislikesCount--;
        }
        await this.postReactionRepository.deleteById(existingReaction.id);
      }
    } else if (existingReaction) {
      if (existingReaction.likeStatus === likeStatus) {
        return;
      }
      if (existingReaction.likeStatus === 'Like') {
        post.likesCount--;
      } else {
        post.dislikesCount--;
      }
      if (likeStatus === 'Like') {
        post.likesCount++;
      } else {
        post.dislikesCount++;
      }
      existingReaction.likeStatus = likeStatus as LikeStatus;
      await this.postReactionRepository.save(existingReaction);
    } else {
      if (likeStatus === 'Like') {
        post.likesCount++;
      } else {
        post.dislikesCount++;
      }
      const reaction = PostReaction.create({
        postId,
        userId,
        likeStatus: likeStatus as LikeStatus,
      });
      await this.postReactionRepository.save(reaction);
    }

    await this.postRepository.save(post);
  }
}
