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
} from '@nestjs/common';
import { BlogService } from '../application/blog.service';
import { CreateBlogInputDto } from './dto/input/create-blog.input.dto';
import { BlogQueryRepository } from '../infastructure/query/blog.query.repository';
import { GetBlogsQueryInputDto } from './dto/input/get-blogs-query.input-dto';
import { type UpdateBlogDto } from '../domain/dto/update-blog.dto';
import { type CreatePostByBlog } from '../domain/dto/create-post.dto';
import { PostService } from '../application/post.service';
import { PostQueryRepository } from '../infastructure/query/post.query.repository';
import { BaseQueryParams } from '../../../core/dto/base.query.sort-params.input-dto';
import { GetPostsQueryInputDto } from './dto/input/get-posts-query.input-dto';

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly postService: PostService,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

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
    const postId: string = await this.postService.createPost({
      blogId,
      ...createPostDto,
    });

    return this.postQueryRepository.findOrNotFoundFail(postId);
  }

  @Get(':blogId/posts')
  async getPostByBlog(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryInputDto,
  ) {
    return this.postQueryRepository.getAll(query, blogId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.blogQueryRepository.getById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    const blogId: string = await this.blogService.updateById(id, updateBlogDto);

    return this.blogQueryRepository.findOrNotFoundFail(blogId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.blogService.deleteById(id);
  }
}
