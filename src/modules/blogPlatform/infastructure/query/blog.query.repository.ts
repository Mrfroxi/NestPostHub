import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Blog,
  BlogDocument,
  type BlogModelType,
} from '../../domain/blod.entity';
import { BlogOutputDto } from '../../api/dto/output/blog.output-dto';
import { GetBlogsQueryInputDto } from '../../api/dto/input/get-blogs-query.input-dto';
import { FilterQuery } from 'mongoose';
import { User } from '../../../user-accounts/domain/user.entity';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class BlogQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findOrNotFoundFail(id: string): Promise<BlogOutputDto> {
    const blog: BlogDocument | null = await this.BlogModel.findById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return BlogOutputDto.mapToOut(blog);
  }

  async getAll(query: GetBlogsQueryInputDto) {
    const filter: FilterQuery<User> = {
      deletedAt: null,
    };

    if (query.searchNameTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: { $regex: query.searchNameTerm, $options: 'i' },
      });
    }

    const blog: BlogDocument[] = await this.BlogModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount: number = await this.BlogModel.countDocuments(filter);

    const items: BlogOutputDto[] = blog.map((blog: BlogDocument) =>
      BlogOutputDto.mapToOut(blog),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getById(id: string) {
    const blog = await this.BlogModel.findById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return BlogOutputDto.mapToOut(blog);
  }
}
