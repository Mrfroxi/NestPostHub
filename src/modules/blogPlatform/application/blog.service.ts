import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../infastructure/blog.repository';
import { CreateBlogDto } from '../domain/dto/create-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blod.entity';
import type { BlogModelType } from '../domain/blod.entity';
import { UpdateBlogDto } from '../domain/dto/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private BlogModule: BlogModelType,
    private readonly BlogRepository: BlogRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = this.BlogModule.createInstance(dto);

    await this.BlogRepository.save(blog);

    return blog.getId;
  }

  async updateById(id: string, updateBlogDto: UpdateBlogDto): Promise<string> {
    const blog: BlogDocument = await this.BlogRepository.findOrNotFoundFail(id);

    blog.update(updateBlogDto);

    await this.BlogRepository.save(blog);

    return blog.getId;
  }

  async deleteById(id: string): Promise<void> {
    const blog: BlogDocument = await this.BlogRepository.findOrNotFoundFail(id);

    blog.makeDeleted();

    await this.BlogRepository.save(blog);
  }
}
