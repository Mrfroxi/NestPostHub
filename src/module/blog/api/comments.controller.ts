import {
  Controller,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CommentQueryRepository } from '@src/module/blog/infrastructure/query/comment.query-repository';
import { DeleteCommentCommand } from '@src/module/blog/application/useCases/delete-comment.usecase';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import {
  CurrentUser,
  type UserPayload,
} from '@core/decorators/current-user.decorator';
import { JwtAuthGuard } from '@src/module/user-accounts/guards/bearer/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentQueryRepository: CommentQueryRepository,
    private commandBus: CommandBus,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: UserPayload,
  ) {
    await this.commandBus.execute(
      new DeleteCommentCommand(commentId, user.userId),
    );
  }
}
