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

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  @Get()
  async getAllPosts(@Query() query: GetPostsQueryInputDto) {
    return this.postQueryRepository.getAll(query);
  }

  @Post()
  async create(@Body() createPostDto: CreatePostInputDto) {
    const postId: string = await this.postService.createPost(createPostDto);

    return this.postQueryRepository.findOrNotFoundFail(postId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.postQueryRepository.getById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    const postId: string = await this.postService.updateById(id, updatePostDto);

    return this.postQueryRepository.findOrNotFoundFail(postId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    await this.postService.deleteById(id);
  }
}
