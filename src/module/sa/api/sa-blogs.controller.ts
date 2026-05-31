import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SABasicAuthGuard } from '@src/module/sa/guards/sa-basic-auth.guard';
import { CreateBlogInputDto } from '@src/module/sa/api/input-dto/create-blog.input-dto';
import { UpdateBlogInputDto } from '@src/module/sa/api/input-dto/update-blog.input-dto';
import { CreatePostInputDto } from '@src/module/sa/api/input-dto/create-post.input-dto';
import { UpdatePostInputDto } from '@src/module/sa/api/input-dto/update-post.input-dto';
import { GetBlogsQueryInputDto } from '@src/module/sa/api/input-dto/get-blogs-query.input-dto';
import { GetPostsQueryInputDto } from '@src/module/sa/api/input-dto/get-posts-query.input-dto';
import { CreateBlogCommand } from '@src/module/sa/application/useCases/create-blog.usecase';
import { UpdateBlogCommand } from '@src/module/sa/application/useCases/update-blog.usecase';
import { DeleteBlogCommand } from '@src/module/sa/application/useCases/delete-blog.usecase';
import { CreatePostCommand } from '@src/module/sa/application/useCases/create-post.usecase';
import { UpdatePostCommand } from '@src/module/sa/application/useCases/update-post.usecase';
import { DeletePostCommand } from '@src/module/sa/application/useCases/delete-post.usecase';
import {
  BlogQueryRepository,
  PaginatedBlogsDto,
} from '@src/module/blog/infrastructure/query/blog.query-repository';
import { PostQueryRepository } from '@src/module/blog/infrastructure/query/post.query-repository';
import { BlogRepository } from '@src/module/blog/infrastructure/blog.repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private commandBus: CommandBus,
    private blogQueryRepository: BlogQueryRepository,
    private postQueryRepository: PostQueryRepository,
    private blogRepository: BlogRepository,
  ) {}

  @UseGuards(SABasicAuthGuard)
  @Get()
  async getBlogs(@Query() query: GetBlogsQueryInputDto) {
    const blogs: PaginatedBlogsDto =
      await this.blogQueryRepository.getBlogsPaginated(query);

    return blogs;
  }

  @UseGuards(SABasicAuthGuard)
  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryInputDto,
  ) {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        extensions: [{ message: 'Blog not found', field: 'blogId' }],
      });
    }

    return this.postQueryRepository.getPostsForBlogPaginated(blogId, query);
  }

  @UseGuards(SABasicAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: CreateBlogInputDto) {
    const blogId: string = await this.commandBus.execute(
      new CreateBlogCommand(body),
    );

    const blog = await this.blogQueryRepository.findById(blogId);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Blog not found after creation',
        extensions: [
          { message: 'Blog not found after creation', field: 'blogId' },
        ],
      });
    }

    return blog;
  }

  @UseGuards(SABasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':blogId/posts')
  async createPost(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostInputDto,
  ) {
    const postId: string = await this.commandBus.execute(
      new CreatePostCommand(blogId, body),
    );

    const post = await this.postQueryRepository.findById(postId);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Post not found after creation',
        extensions: [
          { message: 'Post not found after creation', field: 'postId' },
        ],
      });
    }

    return post;
  }

  @UseGuards(SABasicAuthGuard)
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(blogId, postId, body));
  }

  @UseGuards(SABasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @UseGuards(SABasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @UseGuards(SABasicAuthGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(blogId, postId));
  }
}
