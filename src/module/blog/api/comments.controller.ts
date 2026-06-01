import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CommentQueryRepository } from '@src/module/blog/infrastructure/query/comment.query-repository';
import { CreateCommentInputDto } from '@src/module/blog/api/input-dto/create-comment.input-dto';
import { UpdateCommentCommand } from '@src/module/blog/application/useCases/update-comment.usecase';
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
  @Put(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() body: CreateCommentInputDto,
    @CurrentUser() user: UserPayload,
  ) {
    await this.commandBus.execute(
      new UpdateCommentCommand(commentId, user.userId, body),
    );
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
