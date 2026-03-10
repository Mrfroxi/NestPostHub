import { Body, Controller, Post } from '@nestjs/common';
import { BlogService } from '../application/blog.service';
import { CreateBlogInputDto } from './dto/input/create-blog.input.dto';
import { BlogQueryRepository } from '../infastructure/query/blog.query.repository';

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly blogQueryRepository: BlogQueryRepository,
  ) {}

  @Post()
  async create(@Body() createBlogDto: CreateBlogInputDto) {
    const blogId: string = await this.blogService.createBlog(createBlogDto);

    return this.blogQueryRepository.findOrNotFoundFail(blogId);
  }
}
