import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import PostReaction from '@src/module/blog/domain/post-reaction.entity';
import type { NewestLike } from '@src/module/blog/infrastructure/query/post.query-repository';

@Injectable()
export class PostReactionRepository {
  constructor(
    @InjectRepository(PostReaction)
    private readonly reactionsRepository: Repository<PostReaction>,
  ) {}

  async findByPostIdAndUserId(
    postId: string,
    userId: string,
  ): Promise<PostReaction | null> {
    return this.reactionsRepository.findOneBy({ postId, userId });
  }

  async findByPostIdsAndUserId(
    postIds: string[],
    userId: string,
  ): Promise<PostReaction[]> {
    if (postIds.length === 0) return [];
    return this.reactionsRepository.findBy({
      postId: In(postIds),
      userId,
    });
  }

  async findNewestLikes(
    postIds: string[],
    limit = 3,
  ): Promise<Map<string, NewestLike[]>> {
    if (postIds.length === 0) return new Map();

    const reactions = await this.reactionsRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'u')
      .where('r.postId IN (:...postIds)', { postIds })
      .andWhere('r.likeStatus = :status', { status: 'Like' })
      .orderBy('r.addedAt', 'DESC')
      .getMany();

    const result = new Map<string, NewestLike[]>();
    for (const r of reactions) {
      const list = result.get(r.postId) ?? [];
      if (list.length < limit) {
        list.push({
          addedAt: r.addedAt.toISOString(),
          userId: r.userId,
          login: r.user.login,
        });
        result.set(r.postId, list);
      }
    }
    return result;
  }

  async save(reaction: PostReaction): Promise<PostReaction> {
    return this.reactionsRepository.save(reaction);
  }

  async deleteById(id: string): Promise<void> {
    await this.reactionsRepository.delete(id);
  }
}
