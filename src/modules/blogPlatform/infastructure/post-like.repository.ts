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
  ): Promise<{ userId: string; login: string; addedAt: Date }[]> {
    return this.PostLikeModel.aggregate([
      { $match: { postId, status: 'Like' } },
      { $sort: { addedAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          let: { uid: { $toObjectId: '$userId' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$uid'] } } }],
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: 1,
          login: '$user.login',
          addedAt: { $ifNull: ['$addedAt', '$createdAt'] },
        },
      },
    ]);
  }

  async findLatestLikesByPosts(
    postIds: string[],
    limit: number = 3,
  ): Promise<
    Map<string, Array<{ userId: string; login: string; addedAt: Date }>>
  > {
    const result = await this.PostLikeModel.aggregate([
      { $match: { postId: { $in: postIds }, status: 'Like' } },
      { $sort: { addedAt: -1 } },
      {
        $group: {
          _id: '$postId',
          docs: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 1,
          docs: { $slice: ['$docs', limit] },
        },
      },
      { $unwind: { path: '$docs', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          let: { uid: { $toObjectId: '$docs.userId' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$uid'] } } }],
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          newestLikes: {
            $push: {
              userId: '$docs.userId',
              login: '$user.login',
              addedAt: {
                $ifNull: ['$docs.addedAt', '$docs.createdAt'],
              },
            },
          },
        },
      },
    ]);

    const map = new Map<
      string,
      Array<{ userId: string; login: string; addedAt: Date }>
    >();
    for (const item of result) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      map.set(item._id, item.newestLikes);
    }

    return map;
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
