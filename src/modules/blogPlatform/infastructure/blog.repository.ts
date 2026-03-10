import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blod.entity';
import type { BlogModelType } from '../domain/blod.entity';

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog: BlogDocument | null = await this.BlogModel.findById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }
}
