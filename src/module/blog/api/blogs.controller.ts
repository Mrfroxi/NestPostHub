import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BlogIdParamDto } from '@src/module/blog/api/input-dto/blog-id.param-dto';
import {
  BlogOutputDto,
  BlogQueryRepository,
  PaginatedBlogsDto,
} from '@src/module/blog/infrastructure/query/blog.query-repository';
import { GetBlogsQueryInputDto } from '@src/module/blog/api/input-dto/get-blogs-query.input-dto';
import { PostQueryRepository } from '@src/module/blog/infrastructure/query/post.query-repository';
import { BlogRepository } from '@src/module/blog/infrastructure/blog.repository';
import { GetPostsQueryInputDto } from '@src/module/blog/api/input-dto/get-posts-query.input-dto';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import { OptionalJwtAuthGuard } from '@src/module/blog/guards/optional-jwt-auth.guard';
import {
  CurrentUser,
  type UserPayload,
} from '@core/decorators/current-user.decorator';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogQueryRepository: BlogQueryRepository,
    private postQueryRepository: PostQueryRepository,
    private blogRepository: BlogRepository,
  ) {}

  @Get()
  async getBlogs(@Query() query: GetBlogsQueryInputDto) {
    const blogs: PaginatedBlogsDto =
      await this.blogQueryRepository.getBlogsPaginated(query);

    return blogs;
  }

  @Get(':id')
  async getBlogById(@Param() params: BlogIdParamDto): Promise<BlogOutputDto> {
    const blog: BlogOutputDto | null = await this.blogQueryRepository.findById(
      params.id,
    );

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    return blog;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryInputDto,
    @CurrentUser() user?: UserPayload,
  ) {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        extensions: [{ message: 'Blog not found', field: 'blogId' }],
      });
    }

    return this.postQueryRepository.getPostsForBlogPaginated(
      blogId,
      query,
      user?.userId,
    );
  }
}
