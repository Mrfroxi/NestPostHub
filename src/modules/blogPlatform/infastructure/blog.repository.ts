import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blog.entity';
import type { BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog: BlogDocument | null = await this.findById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }
}
