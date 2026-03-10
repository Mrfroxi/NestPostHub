import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Blog,
  BlogDocument,
  type BlogModelType,
} from '../../domain/blod.entity';
import { BlogOutputDto } from '../../api/dto/output/blog.output-dto';

@Injectable()
export class BlogQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

  async findOrNotFoundFail(id: string): Promise<BlogOutputDto> {
    const blog: BlogDocument | null = await this.blogModel.findById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return BlogOutputDto.mapToOut(blog);
  }
}
