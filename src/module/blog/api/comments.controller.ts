import { Controller, Get, Param } from '@nestjs/common';
import { CommentQueryRepository } from '@src/module/blog/infrastructure/query/comment.query-repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

@Controller('comments')
export class CommentsController {
  constructor(private commentQueryRepository: CommentQueryRepository) {}

  @Get(':id')
  async getCommentById(@Param('id') id: string) {
    const comment = await this.commentQueryRepository.findById(id);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return comment;
  }
}
