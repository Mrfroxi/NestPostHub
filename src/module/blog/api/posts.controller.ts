import {
  Controller,
  Get,
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
import { CreateCommentInputDto } from '@src/module/blog/api/input-dto/create-comment.input-dto';
import { CreateCommentCommand } from '@src/module/blog/application/useCases/create-comment.usecase';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import {
  CurrentUser,
  type UserPayload,
} from '@core/decorators/current-user.decorator';
import { JwtAuthGuard } from '@src/module/user-accounts/guards/bearer/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private postQueryRepository: PostQueryRepository,
    private commentQueryRepository: CommentQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getPosts(@Query() query: GetPostsQueryInputDto) {
    return this.postQueryRepository.getAllPostsPaginated(query);
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.postQueryRepository.findById(id);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    return post;
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
