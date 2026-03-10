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

@Injectable()
export class PostQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findOrNotFoundFail(id: string): Promise<PostOutputDto> {
    const post: PostDocument | null = await this.PostModel.findById(id);

    if (!post) {
      throw new NotFoundException();
    }

    return PostOutputDto.mapToOut(post);
  }

  async getAll(query: GetPostsQueryInputDto) {
    const filter: FilterQuery<Post> = {
      deletedAt: null,
    };

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
    const post = await this.PostModel.findById(id);

    if (!post) {
      throw new NotFoundException();
    }

    return PostOutputDto.mapToOut(post);
  }
}
