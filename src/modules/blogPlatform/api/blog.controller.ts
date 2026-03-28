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
import { BlogService } from '../application/blog.service';
import { CreateBlogInputDto } from './dto/input/create-blog.input.dto';
import { BlogQueryRepository } from '../infastructure/query/blog.query.repository';
import { GetBlogsQueryInputDto } from './dto/input/get-blogs-query.input-dto';
import { UpdateBlogDto } from '../domain/dto/update-blog.dto';
import { type CreatePostByBlog } from '../domain/dto/create-post.dto';
import { PostService } from '../application/post.service';
import { PostQueryRepository } from '../infastructure/query/post.query.repository';
import { GetPostsQueryInputDto } from './dto/input/get-posts-query.input-dto';
import { BlogDocument } from '../domain/blog.entity';
import { BasicAuthGuard } from '../../../core/guards/basic/basic-auth.guard';
import { Public } from '../../../core/decorators/public.decorator';

@Controller('blogs')
@UseGuards(BasicAuthGuard)
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly postService: PostService,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  @Public()
  @Get()
  async getAllBlogs(@Query() query: GetBlogsQueryInputDto) {
    return this.blogQueryRepository.getAll(query);
  }

  @Post()
  async create(@Body() createBlogDto: CreateBlogInputDto) {
    const blogId: string = await this.blogService.createBlog(createBlogDto);

    return this.blogQueryRepository.findOrNotFoundFail(blogId);
  }

  @Post(':blogId/posts')
  async createPost(
    @Param('blogId') blogId: string,
    @Body()
    createPostDto: CreatePostByBlog,
  ) {
    const blog: BlogDocument = await this.blogService.findById(blogId);

    const postId: string = await this.postService.createPost({
      blogId,
      blogName: blog.getName,
      ...createPostDto,
    });

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
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    await this.blogService.updateById(id, updateBlogDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.blogService.deleteById(id);
  }
}
