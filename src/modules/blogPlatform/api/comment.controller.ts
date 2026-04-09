import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentQueryRepository } from '../infastructure/query/comment.query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../core/guards/jwt/jwt-auth.guard';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { LikeDislikeCommentCommand } from '../application/useCases/comment/like-dislike-comment-command';
import { DeleteCommentCommand } from '../application/useCases/comment/delete-comment-command';
import { UpdateCommentCommand } from '../application/useCases/comment/update-comment-command';
import { CommentLikeStatusInputDto } from './dto/input/comment-like-status.input.dto';
import { UpdateCommentInputDto } from './dto/input/update-comment.input.dto';
import { Public } from '../../../core/decorators/public.decorator';
import { JwtPublicAuthGuard } from '../../../core/guards/jwt/jwt-public-guard';
import { CurrentPublicUser } from '../../../core/decorators/current-user.decorator';
import { commentParamId } from './dto/input/get-id-param';

@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentQueryRepository: CommentQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Public()
  @UseGuards(JwtPublicAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentPublicUser() user: { userId: string } | null,
  ) {
    return this.commentQueryRepository.getById(id, user?.userId);
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async likeDislikeComment(
    @Param() commentId: commentParamId,
    @Body() likeStatusDto: CommentLikeStatusInputDto,
    @CurrentUser() user: { login: string },
  ): Promise<void> {
    await this.commandBus.execute(
      new LikeDislikeCommentCommand(
        commentId.commentId,
        user.login,
        likeStatusDto.likeStatus,
      ),
    );
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param() commentId: commentParamId,
    @CurrentUser() user: { login: string },
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteCommentCommand(commentId.commentId, user.login),
    );
  }

  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param() commentId: commentParamId,
    @Body() updateCommentDto: UpdateCommentInputDto,
    @CurrentUser() user: { login: string },
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommand(
        commentId.commentId,
        user.login,
        updateCommentDto,
      ),
    );
  }
}
