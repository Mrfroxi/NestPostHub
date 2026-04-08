import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeDocument,
  type CommentLikeModelType,
} from '../domain/comment-like.entity';
import { LikeStatus } from '../domain/comment-like.entity';

interface LikesCountInfo {
  likesCount: number;
  dislikesCount: number;
}

@Injectable()
export class CommentLikeRepository {
  constructor(
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}

  async findByCommentAndUser(
    commentId: string,
    userId: string,
  ): Promise<CommentLikeDocument | null> {
    return this.CommentLikeModel.findOne({ commentId, userId });
  }

  async upsert(
    commentId: string,
    userId: string,
    status: LikeStatus,
  ): Promise<void> {
    const existing: CommentLikeDocument | null =
      await this.CommentLikeModel.findOne({ commentId, userId });

    await this.CommentLikeModel.updateOne(
      { commentId, userId },
      {
        $set: {
          commentId,
          userId,
          status,
          addedAt: existing?.addedAt ?? new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  async getLikesInfo(
    commentId: string,
  ): Promise<{ likesCount: number; dislikesCount: number }> {
    const result = await this.CommentLikeModel.aggregate<LikesCountInfo>([
      { $match: { commentId, status: { $in: ['Like', 'Dislike'] } } },
      {
        $group: {
          _id: null,
          likesCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Like'] }, 1, 0] },
          },
          dislikesCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Dislike'] }, 1, 0] },
          },
        },
      },
    ]);

    return result[0] ?? { likesCount: 0, dislikesCount: 0 };
  }
}
