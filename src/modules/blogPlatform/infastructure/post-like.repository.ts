import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLike,
  PostLikeDocument,
  type PostLikeModelType,
} from '../domain/post-like.entity';
import { LikeStatus } from '../domain/post-like.entity';

interface LikesCountInfo {
  likesCount: number;
  dislikesCount: number;
}

@Injectable()
export class PostLikeRepository {
  constructor(
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}

  async findByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<PostLikeDocument | null> {
    return this.PostLikeModel.findOne({ postId, userId });
  }

  async findLatestLikesByPost(
    postId: string,
    limit: number = 3,
  ): Promise<PostLikeDocument[]> {
    return this.PostLikeModel.find({ postId, status: 'Like' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async upsert(
    postId: string,
    userId: string,
    status: LikeStatus,
  ): Promise<void> {
    const existing: PostLikeDocument | null = await this.PostLikeModel.findOne({
      postId,
      userId,
    });

    await this.PostLikeModel.updateOne(
      { postId, userId },
      {
        $set: {
          postId,
          userId,
          status,
          addedAt: existing?.addedAt ?? new Date(),
        },
      },
      { upsert: true },
    );
  }

  async getLikesInfo(
    postId: string,
  ): Promise<{ likesCount: number; dislikesCount: number }> {
    const result = await this.PostLikeModel.aggregate<LikesCountInfo>([
      { $match: { postId, status: { $in: ['Like', 'Dislike'] } } },
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
