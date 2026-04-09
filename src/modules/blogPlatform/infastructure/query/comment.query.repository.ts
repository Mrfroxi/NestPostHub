import { Injectable } from '@nestjs/common';
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
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { PostRepository } from '../post.repository';
import { CommentLikeRepository } from '../comment-like.repository';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private postRepository: PostRepository,
    private commentLikeRepository: CommentLikeRepository,
  ) {}

  async getById(id: string, currentUserId?: string) {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'comment not found', field: 'comment' }],
      });
    }

    const likesInfo = await this.buildLikesInfo(id, currentUserId, comment);

    return CommentOutputDto.mapToOut(comment, likesInfo);
  }

  async getAll(
    query: GetCommentsQueryInputDto,
    postId: string,
    currentUserId?: string,
  ) {
    const filter: FilterQuery<Comment> = {
      deletedAt: null,
    };

    const isPost = await this.postRepository.findOrNotFoundFail(postId);

    if (!isPost) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'post not found', field: 'isPost' }],
      });
    }

    filter.postId = postId;

    const comments: CommentDocument[] = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount: number = await this.CommentModel.countDocuments(filter);

    const items = await Promise.all(
      comments.map(async (comment: CommentDocument) =>
        CommentOutputDto.mapToOut(
          comment,
          await this.buildLikesInfo(comment.getId, currentUserId, comment),
        ),
      ),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  private async buildLikesInfo(
    commentId: string,
    currentUserId: string | undefined,
    comment: CommentDocument,
  ): Promise<{ likesCount: number; dislikesCount: number; myStatus: string }> {
    let myStatus = 'None';

    if (currentUserId) {
      const userLike = await this.commentLikeRepository.findByCommentAndUser(
        commentId,
        currentUserId,
      );
      myStatus = userLike?.status ?? 'None';
    }

    return {
      likesCount: comment.likesCount ?? 0,
      dislikesCount: comment.dislikesCount ?? 0,
      myStatus,
    };
  }
}
