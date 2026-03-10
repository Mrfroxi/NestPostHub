import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../infastructure/blog.repository';
import { CreateBlogDto } from '../domain/dto/create-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../domain/blod.entity';
import type { BlogModelType } from '../domain/blod.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private BlogModule: BlogModelType,
    private readonly blogRepository: BlogRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = this.BlogModule.createInstance(dto);

    await this.blogRepository.save(blog);

    return blog.getId;
  }
}
