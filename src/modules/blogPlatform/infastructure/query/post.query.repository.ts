import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Post,
  PostDocument,
  type PostModelType,
} from '../../domain/post.entity';
import { PostOutputDto } from '../../api/dto/output/post.output-dto';
import { GetPostsQueryInputDto } from '../../api/dto/input/get-posts-query.input-dto';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Blog, type BlogModelType } from '../../domain/blog.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { PostLikeRepository } from '../post-like.repository';

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private postLikeRepository: PostLikeRepository,
  ) {}

  async findOrNotFoundFail(id: string): Promise<PostOutputDto> {
    const post: PostDocument | null = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new NotFoundException();
    }

    const newestLikes = await this.postLikeRepository.findLatestLikesByPost(id);

    return PostOutputDto.mapToOut(post, {
      likesCount: post.likesCount ?? 0,
      dislikesCount: post.dislikesCount ?? 0,
      myStatus: 'None',
      newestLikes,
    });
  }

  async getAll(
    query: GetPostsQueryInputDto,
    blogId?: string,
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    if (blogId) {
      const blog = await this.BlogModel.findOne({
        _id: blogId,
        deletedAt: null,
      });

      if (!blog) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          extensions: [{ message: 'blog not found', field: 'blog' }],
        });
      }
    }

    const filter: FilterQuery<Post> = {
      deletedAt: null,
    };

    if (blogId) {
      filter.blogId = blogId;
    }

    const posts: PostDocument[] = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount: number = await this.PostModel.countDocuments(filter);

    const postIds = posts.map((p) => p.getId);
    const likesMap =
      await this.postLikeRepository.findLatestLikesByPosts(postIds);

    const items: PostOutputDto[] = posts.map((post: PostDocument) =>
      PostOutputDto.mapToOut(post, {
        likesCount: post.likesCount ?? 0,
        dislikesCount: post.dislikesCount ?? 0,
        myStatus: 'None',
        newestLikes: likesMap.get(post.getId) ?? [],
      }),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getById(postId: string, currentUserId?: string) {
    const post: PostDocument | null = await this.PostModel.findOne({
      _id: postId,
      deletedAt: null,
    });

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'post not found', field: 'post' }],
      });
    }

    const newestLikes =
      await this.postLikeRepository.findLatestLikesByPost(postId);

    let myStatus = 'None';

    if (currentUserId) {
      const userLike = await this.postLikeRepository.findByPostAndUser(
        postId,
        currentUserId,
      );
      myStatus = userLike?.status ?? 'None';
    }

    return PostOutputDto.mapToOut(post, {
      likesCount: post.likesCount ?? 0,
      dislikesCount: post.dislikesCount ?? 0,
      myStatus,
      newestLikes,
    });
  }
}
