import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blod.entity';
import type { BlogModelType } from '../domain/blod.entity';

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }
}
