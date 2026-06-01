import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Comment from '@src/module/blog/domain/comment.entity';
import { GetCommentsQueryInputDto } from '@src/module/blog/api/input-dto/get-comments-query.input-dto';

export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'None' | 'Like' | 'Dislike';
};

export type CommentOutputDto = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
};

export type PaginatedCommentsDto = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentOutputDto[];
};

@Injectable()
export class CommentQueryRepository {
  private readonly allowedSortFields = ['createdAt', 'content', 'userLogin'];

  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async findById(id: string): Promise<CommentOutputDto | null> {
    const comment = await this.commentsRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u')
      .where('c.id = :id', { id })
      .getOne();
    if (!comment) return null;

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.user.login,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }

  async getCommentsForPostPaginated(
    postId: string,
    query: GetCommentsQueryInputDto,
  ): Promise<PaginatedCommentsDto> {
    const sortBy = this.allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const direction = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    const queryBuilder = this.commentsRepository.createQueryBuilder('c');

    queryBuilder.leftJoinAndSelect('c.user', 'u');
    queryBuilder.where('c.postId = :postId', { postId });

    const stringFields = ['content'];
    if (sortBy === 'userLogin') {
      queryBuilder.orderBy(`u.login COLLATE "C"`, direction);
    } else if (stringFields.includes(sortBy)) {
      queryBuilder.orderBy(`c.${sortBy} COLLATE "C"`, direction);
    } else {
      queryBuilder.orderBy(`c.${sortBy}`, direction);
    }

    const [comments, totalCount] = await queryBuilder
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: comments.map((c) => ({
        id: c.id,
        content: c.content,
        commentatorInfo: {
          userId: c.userId,
          userLogin: c.user?.login,
        },
        createdAt: c.createdAt.toISOString(),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      })),
    };
  }
}
