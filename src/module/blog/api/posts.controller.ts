import {
  Controller,
  Get,
  Put,
  Param,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PostQueryRepository } from '@src/module/blog/infrastructure/query/post.query-repository';
import { CommentQueryRepository } from '@src/module/blog/infrastructure/query/comment.query-repository';
import { GetPostsQueryInputDto } from '@src/module/blog/api/input-dto/get-posts-query.input-dto';
import { GetCommentsQueryInputDto } from '@src/module/blog/api/input-dto/get-comments-query.input-dto';
import { CreateCommentInputDto } from '@src/module/blog/api/input-dto/create-comment.input-dto';
import { LikeStatusInputDto } from '@src/module/blog/api/input-dto/like-status.input-dto';
import { CreateCommentCommand } from '@src/module/blog/application/useCases/create-comment.usecase';
import { LikePostCommand } from '@src/module/blog/application/useCases/like-post.usecase';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import {
  CurrentUser,
  type UserPayload,
} from '@core/decorators/current-user.decorator';
import { JwtAuthGuard } from '@src/module/user-accounts/guards/bearer/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '@src/module/blog/guards/optional-jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private postQueryRepository: PostQueryRepository,
    private commentQueryRepository: CommentQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getPosts(
    @Query() query: GetPostsQueryInputDto,
    @CurrentUser() user?: UserPayload,
  ) {
    return this.postQueryRepository.getAllPostsPaginated(query, user?.userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Query() query: GetCommentsQueryInputDto,
    @CurrentUser() user?: UserPayload,
  ) {
    const post = await this.postQueryRepository.findById(postId);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    return this.commentQueryRepository.getCommentsForPostPaginated(
      postId,
      query,
      user?.userId,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    @CurrentUser() user?: UserPayload,
  ) {
    const post = await this.postQueryRepository.findById(id, user?.userId);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    return post;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':postId/like-status')
  async likePost(
    @Param('postId') postId: string,
    @Body() body: LikeStatusInputDto,
    @CurrentUser() user: UserPayload,
  ) {
    await this.commandBus.execute(
      new LikePostCommand(postId, user.userId, body.likeStatus),
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':postId/comments')
  async createComment(
    @Param('postId') postId: string,
    @Body() body: CreateCommentInputDto,
    @CurrentUser() user: UserPayload,
  ) {
    const commentId: string = await this.commandBus.execute(
      new CreateCommentCommand(postId, user.userId, body),
    );

    const comment = await this.commentQueryRepository.findById(commentId);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Comment not found after creation',
        extensions: [
          { message: 'Comment not found after creation', field: 'commentId' },
        ],
      });
    }

    return comment;
  }
}
