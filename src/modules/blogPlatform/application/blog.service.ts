import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../infastructure/blog.repository';
import { CreateBlogDto } from '../domain/dto/create-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blog.entity';
import type { BlogModelType } from '../domain/blog.entity';
import { UpdateBlogDto } from '../domain/dto/update-blog.dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private BlogModule: BlogModelType,
    private readonly blogRepository: BlogRepository,
  ) {}

  async findById(id: string): Promise<BlogDocument> {
    const blog: BlogDocument | null =
      await this.blogRepository.findOrNotFoundFail(id);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'blog not found', field: 'blog' }],
      });
    }

    return blog;
  }

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = this.BlogModule.createInstance(dto);

    await this.blogRepository.save(blog);

    return blog.getId;
  }

  async updateById(id: string, updateBlogDto: UpdateBlogDto): Promise<string> {
    const blog: BlogDocument | null =
      await this.blogRepository.findOrNotFoundFail(id);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'blog not found', field: 'blog' }],
      });
    }

    blog.update(updateBlogDto);

    await this.blogRepository.save(blog);

    return blog.getId;
  }

  async deleteById(id: string): Promise<void> {
    const blog: BlogDocument | null =
      await this.blogRepository.findOrNotFoundFail(id);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'blog not found', field: 'blog' }],
      });
    }

    blog.makeDeleted();

    await this.blogRepository.save(blog);
  }
}
