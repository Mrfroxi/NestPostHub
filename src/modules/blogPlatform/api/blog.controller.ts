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
import { BlogQueryRepository } from '../infastructure/query/blog.query.repository';
import { GetBlogsQueryInputDto } from './dto/input/get-blogs-query.input-dto';
import { UpdateBlogDto } from '../domain/dto/update-blog.dto';
import { CreatePostInputDto } from './dto/input/create-post.input.dto';
import { CreatePostByBlogDto } from './dto/input/create-post-by-blog.input.dto';
import { PostQueryRepository } from '../infastructure/query/post.query.repository';
import { GetPostsQueryInputDto } from './dto/input/get-posts-query.input-dto';
import { BasicAuthGuard } from '../../../core/guards/basic/basic-auth.guard';
import { Public } from '../../../core/decorators/public.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogInputDto } from './dto/input/create-blog.input.dto';
import { CreateBlogCommand } from '../application/useCases/blog/create-blog-command';
import { UpdateBlogCommand } from '../application/useCases/blog/update-blog-command';
import { DeleteBlogCommand } from '../application/useCases/blog/delete-blog-command';
import { CreatePostByBlogCommand } from '../application/useCases/blog/create-post-by-blog-command';
import { UserIdParamDto } from '../../user-accounts/api/input-dto/user-id-param.dto';

@Controller('blogs')
@UseGuards(BasicAuthGuard)
export class BlogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  @Public()
  @Get()
  async getAllBlogs(@Query() query: GetBlogsQueryInputDto) {
    return this.blogQueryRepository.getAll(query);
  }

  @Post()
  async create(@Body() createBlogDto: CreateBlogInputDto) {
    const blogId: string = await this.commandBus.execute(
      new CreateBlogCommand(createBlogDto),
    );

    return this.blogQueryRepository.findOrNotFoundFail(blogId);
  }

  @Post(':blogId/posts')
  async createPost(
    @Param('blogId') blogId: string,
    @Body() createPostDto: CreatePostByBlogDto,
  ) {
    const postId: string = await this.commandBus.execute(
      new CreatePostByBlogCommand(blogId, createPostDto),
    );

    return this.postQueryRepository.findOrNotFoundFail(postId);
  }

  @Public()
  @Get(':blogId/posts')
  async getPostByBlog(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryInputDto,
  ) {
    return this.postQueryRepository.getAll(query, blogId);
  }

  @Public()
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.blogQueryRepository.getById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateBlogCommand(id, updateBlogDto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param() params: UserIdParamDto): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(params.id));
  }
}
