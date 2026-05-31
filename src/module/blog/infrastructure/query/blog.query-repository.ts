import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Blog from '@src/module/blog/domain/blog.entity';
import { GetBlogsQueryInputDto } from '@src/module/blog/api/input-dto/get-blogs-query.input-dto';

export type BlogOutputDto = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type PaginatedBlogsDto = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogOutputDto[];
};

@Injectable()
export class BlogQueryRepository {
  private readonly allowedSortFields = [
    'createdAt',
    'name',
    'description',
    'websiteUrl',
  ];

  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  async findById(id: string): Promise<BlogOutputDto | null> {
    const blog = await this.blogsRepository.findOneBy({ id });
    if (!blog) return null;

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }

  async getBlogsPaginated(
    query: GetBlogsQueryInputDto,
  ): Promise<PaginatedBlogsDto> {
    const sortBy = this.allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const direction = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    const queryBuilder = this.blogsRepository.createQueryBuilder('b');

    if (query.searchNameTerm) {
      queryBuilder.where('b.name ILIKE :name', {
        name: `%${query.searchNameTerm}%`,
      });
    }

    const stringFields = ['name', 'description', 'websiteUrl'];

    if (stringFields.includes(sortBy)) {
      queryBuilder.orderBy(`b.${sortBy} COLLATE "C"`, direction);
    } else {
      queryBuilder.orderBy(`b.${sortBy}`, direction);
    }

    const [blogs, totalCount] = await queryBuilder
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: blogs.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt.toISOString(),
        isMembership: b.isMembership,
      })),
    };
  }
}
