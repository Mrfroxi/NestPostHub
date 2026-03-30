import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Post,
  PostDocument,
  type PostModelType,
} from '../../domain/post.entity';
import { PostOutputDto } from '../../api/dto/output/post.output-dto';
import { GetPostsQueryInputDto } from '../../api/dto/input/get-posts-query.input-dto';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import {
  Blog,
  BlogDocument,
  type BlogModelType,
} from '../../domain/blog.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async findOrNotFoundFail(id: string): Promise<PostOutputDto> {
    const post: PostDocument | null = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new NotFoundException();
    }

    return PostOutputDto.mapToOut(post);
  }

  async getAll(
    query: GetPostsQueryInputDto,
    blogId?: string,
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    if (blogId) {
      const blog = await this.BlogModel.findOne({
        _id: blogId,
        deletedAt: null,
      });

      if (!blog) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          extensions: [{ message: 'blog not found', field: 'blog' }],
        });
      }
    }

    const filter: FilterQuery<Post> = {
      deletedAt: null,
    };

    if (blogId) {
      filter.blogId = blogId;
    }

    const posts: PostDocument[] = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount: number = await this.PostModel.countDocuments(filter);

    const items: PostOutputDto[] = posts.map((post: PostDocument) =>
      PostOutputDto.mapToOut(post),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getById(id: string) {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'post not found', field: 'post' }],
      });
    }

    return PostOutputDto.mapToOut(post);
  }
}
