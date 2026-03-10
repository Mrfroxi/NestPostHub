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

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly blogQueryRepository: BlogQueryRepository,
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
