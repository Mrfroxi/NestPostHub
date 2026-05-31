import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Post from '@src/module/blog/domain/post.entity';
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
  ];

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findById(id: string): Promise<PostOutputDto | null> {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) return null;

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }

  async getPostsForBlogPaginated(
    blogId: string,
    query: GetPostsQueryInputDto,
  ): Promise<PaginatedPostsDto> {
    const sortBy = this.allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const direction = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    const queryBuilder = this.postsRepository.createQueryBuilder('p');

    queryBuilder.where('p.blogId = :blogId', { blogId });

    queryBuilder.orderBy(`p.${sortBy}`, direction);

    const [posts, totalCount] = await queryBuilder
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

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
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      })),
    };
  }

  async getAllPostsPaginated(
    query: GetPostsQueryInputDto,
  ): Promise<PaginatedPostsDto> {
    const sortBy = this.allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const direction = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    const queryBuilder = this.postsRepository.createQueryBuilder('p');

    queryBuilder.orderBy(`p.${sortBy}`, direction);

    const [posts, totalCount] = await queryBuilder
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

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
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      })),
    };
  }
}