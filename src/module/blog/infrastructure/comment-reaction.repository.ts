import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import CommentReaction from '@src/module/blog/domain/comment-reaction.entity';

@Injectable()
export class CommentReactionRepository {
  constructor(
    @InjectRepository(CommentReaction)
    private readonly reactionsRepository: Repository<CommentReaction>,
  ) {}

  async findByCommentIdAndUserId(
    commentId: string,
    userId: string,
  ): Promise<CommentReaction | null> {
    return this.reactionsRepository.findOneBy({ commentId, userId });
  }

  async findByCommentIdsAndUserId(
    commentIds: string[],
    userId: string,
  ): Promise<CommentReaction[]> {
    return this.reactionsRepository.findBy({
      commentId: In(commentIds),
      userId,
    });
  }

  async save(reaction: CommentReaction): Promise<CommentReaction> {
    return this.reactionsRepository.save(reaction);
  }

  async deleteById(id: string): Promise<void> {
    await this.reactionsRepository.delete(id);
  }
}
