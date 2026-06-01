import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Post from '@src/module/blog/domain/post.entity';
import { PostReactionRepository } from '@src/module/blog/infrastructure/post-reaction.repository';
import { GetPostsQueryInputDto } from '@src/module/blog/api/input-dto/get-posts-query.input-dto';

export type NewestLike = {
  addedAt: string;
  userId: string;
  login: string;
};

export type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'None' | 'Like' | 'Dislike';
  newestLikes: NewestLike[];
};

export type PostOutputDto = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
};

export type PaginatedPostsDto = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostOutputDto[];
};

@Injectable()
export class PostQueryRepository {
  private readonly allowedSortFields = [
    'createdAt',
    'title',
    'shortDescription',
    'content',
    'blogName',
  ];

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly postReactionRepository: PostReactionRepository,
  ) {}

  async findById(
    id: string,
    currentUserId?: string,
  ): Promise<PostOutputDto | null> {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) return null;

    const { myStatus, newestLikes } = await this.buildLikesInfo(
      [post],
      currentUserId,
    );

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: myStatus.get(id) ?? 'None',
        newestLikes: newestLikes.get(id) ?? [],
      },
    };
  }

  async getPostsForBlogPaginated(
    blogId: string,
    query: GetPostsQueryInputDto,
    currentUserId?: string,
  ): Promise<PaginatedPostsDto> {
    const sortBy = this.allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const direction = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    const queryBuilder = this.postsRepository.createQueryBuilder('p');

    queryBuilder.where('p.blogId = :blogId', { blogId });

    if (sortBy === 'blogName') {
      queryBuilder
        .orderBy(`p.${sortBy} COLLATE "C"`, direction)
        .addOrderBy(
          `CAST(COALESCE(NULLIF(SUBSTRING(p.${sortBy} FROM '\\d+$'), ''), '0') AS INTEGER)`,
          direction,
        );
    } else if (['title', 'shortDescription', 'content'].includes(sortBy)) {
      queryBuilder.orderBy(`p.${sortBy} COLLATE "C"`, direction);
    } else {
      queryBuilder.orderBy(`p.${sortBy}`, direction);
    }

    const [posts, totalCount] = await queryBuilder
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    const { myStatus, newestLikes } = await this.buildLikesInfo(
      posts,
      currentUserId,
    );

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: posts.map((p) => ({
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt.toISOString(),
        extendedLikesInfo: {
          likesCount: p.likesCount,
          dislikesCount: p.dislikesCount,
          myStatus: myStatus.get(p.id) ?? 'None',
          newestLikes: newestLikes.get(p.id) ?? [],
        },
      })),
    };
  }

  async getAllPostsPaginated(
    query: GetPostsQueryInputDto,
    currentUserId?: string,
  ): Promise<PaginatedPostsDto> {
    const sortBy = this.allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const direction = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    const queryBuilder = this.postsRepository.createQueryBuilder('p');

    if (sortBy === 'blogName') {
      queryBuilder
        .orderBy(`p.${sortBy} COLLATE "C"`, direction)
        .addOrderBy(
          `CAST(COALESCE(NULLIF(SUBSTRING(p.${sortBy} FROM '\\d+$'), ''), '0') AS INTEGER)`,
          direction,
        );
    } else if (['title', 'shortDescription', 'content'].includes(sortBy)) {
      queryBuilder.orderBy(`p.${sortBy} COLLATE "C"`, direction);
    } else {
      queryBuilder.orderBy(`p.${sortBy}`, direction);
    }

    const [posts, totalCount] = await queryBuilder
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    const { myStatus, newestLikes } = await this.buildLikesInfo(
      posts,
      currentUserId,
    );

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: posts.map((p) => ({
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt.toISOString(),
        extendedLikesInfo: {
          likesCount: p.likesCount,
          dislikesCount: p.dislikesCount,
          myStatus: myStatus.get(p.id) ?? 'None',
          newestLikes: newestLikes.get(p.id) ?? [],
        },
      })),
    };
  }

  private async buildLikesInfo(
    posts: Post[],
    currentUserId?: string,
  ): Promise<{
    myStatus: Map<string, 'None' | 'Like' | 'Dislike'>;
    newestLikes: Map<string, NewestLike[]>;
  }> {
    const postIds = posts.map((p) => p.id);

    const myStatus = new Map<string, 'None' | 'Like' | 'Dislike'>();
    if (currentUserId && postIds.length > 0) {
      const reactions =
        await this.postReactionRepository.findByPostIdsAndUserId(
          postIds,
          currentUserId,
        );
      for (const r of reactions) {
        myStatus.set(r.postId, r.likeStatus);
      }
    }

    const newestLikes =
      postIds.length > 0
        ? await this.postReactionRepository.findNewestLikes(postIds)
        : new Map();

    return { myStatus, newestLikes };
  }
}
