import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Comment,
  CommentDocument,
  type CommentModelType,
} from '../../domain/comment.entity';
import { CommentOutputDto } from '../../api/dto/output/comment.output-dto';
import { GetCommentsQueryInputDto } from '../../api/dto/input/get-comments-query.input-dto';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async getById(id: string) {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!comment) {
      throw new NotFoundException();
    }

    return CommentOutputDto.mapToOut(comment);
  }

  async getAll(query: GetCommentsQueryInputDto, postId?: string) {
    const filter: FilterQuery<Comment> = {
      deletedAt: null,
    };

    if (postId) {
      filter.postId = postId;
    }

    const comments: CommentDocument[] = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount: number = await this.CommentModel.countDocuments(filter);

    const items: CommentOutputDto[] = comments.map((comment: CommentDocument) =>
      CommentOutputDto.mapToOut(comment),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
