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
import { PostService } from '../application/post.service';
import { CreatePostInputDto } from './dto/input/create-post.input.dto';
import { PostQueryRepository } from '../infastructure/query/post.query.repository';
import { GetPostsQueryInputDto } from './dto/input/get-posts-query.input-dto';
import { type UpdatePostDto } from '../domain/dto/update-post.dto';
import { CommentService } from '../application/comment.service';
import { CommentQueryRepository } from '../infastructure/query/comment.query.repository';
import { type CreateCommentByPostDto } from '../domain/dto/create-comment.dto';
import { GetCommentsQueryInputDto } from './dto/input/get-comments-query.input-dto';
import { BlogService } from '../application/blog.service';
import { BlogDocument } from '../domain/blog.entity';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postQueryRepository: PostQueryRepository,
    private readonly commentService: CommentService,
    private readonly commentQueryRepository: CommentQueryRepository,
    private readonly blogService: BlogService,
  ) {}

  @Get()
  async getAllPosts(@Query() query: GetPostsQueryInputDto) {
    return this.postQueryRepository.getAll(query);
  }

  @Post()
  async create(@Body() createPostDto: CreatePostInputDto) {
    const blog: BlogDocument = await this.blogService.findById(
      createPostDto.blogId,
    );

    const postId: string = await this.postService.createPost({
      ...createPostDto,
      blogName: blog.getName,
    });

    return this.postQueryRepository.findOrNotFoundFail(postId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.postQueryRepository.getById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    await this.postService.updateById(id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    await this.postService.deleteById(id);
  }

  @Post(':postId/comments')
  async createComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentByPostDto,
  ) {
    const commentId: string = await this.commentService.createComment({
      postId,
      ...createCommentDto,
    });

    return this.commentQueryRepository.getById(commentId);
  }

  @Get(':postId/comments')
  async getCommentsByPost(
    @Param('postId') postId: string,
    @Query() query: GetCommentsQueryInputDto,
  ) {
    return this.commentQueryRepository.getAll(query, postId);
  }
}
