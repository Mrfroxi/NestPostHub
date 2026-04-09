import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostQueryRepository } from '../infastructure/query/post.query.repository';
import { GetPostsQueryInputDto } from './dto/input/get-posts-query.input-dto';
import { UpdatePostDto } from '../domain/dto/update-post.dto';
import { CommentQueryRepository } from '../infastructure/query/comment.query.repository';
import {
  type CreateCommentByPostDto,
  CreateCommentPostDto,
} from '../domain/dto/create-comment.dto';
import { GetCommentsQueryInputDto } from './dto/input/get-comments-query.input-dto';
import { BasicAuthGuard } from '../../../core/guards/basic/basic-auth.guard';
import { Public } from '../../../core/decorators/public.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostInputDto } from './dto/input/create-post.input.dto';
import { CreatePostCommand } from '../application/useCases/post/create-post-command';
import { UpdatePostCommand } from '../application/useCases/post/update-post-command';
import { DeletePostCommand } from '../application/useCases/post/delete-post-command';
import { CreateCommentCommand } from '../application/useCases/post/create-comment-command';
import { LikeDislikePostCommand } from '../application/useCases/post/like-dislike-post-command';
import { UserIdParamDto } from '../../user-accounts/api/input-dto/user-id-param.dto';
import { LikeStatusInputDto } from './dto/input/like-status.input.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt/jwt-auth.guard';
import {
  CurrentPublicUser,
  CurrentUser,
} from '../../../core/decorators/current-user.decorator';
import { JwtPublicAuthGuard } from '../../../core/guards/jwt/jwt-public-guard';
import { postParamId } from './dto/input/get-id-param';

@UseGuards(BasicAuthGuard)
@Controller('posts')
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postQueryRepository: PostQueryRepository,
    private readonly commentQueryRepository: CommentQueryRepository,
  ) {}
  @Public()
  @Get()
  async getAllPosts(@Query() query: GetPostsQueryInputDto) {
    return this.postQueryRepository.getAll(query);
  }

  @Post()
  async create(@Body() createPostDto: CreatePostInputDto) {
    const postId: string = await this.commandBus.execute(
      new CreatePostCommand(createPostDto),
    );

    return this.postQueryRepository.findOrNotFoundFail(postId);
  }

  @Public()
  @UseGuards(JwtPublicAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentPublicUser() user: { userId: string } | null,
  ) {
    return this.postQueryRepository.getById(id, user?.userId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(id, updatePostDto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param() params: UserIdParamDto): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(params.id));
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async createComment(
    @CurrentUser() user: { userId: string; login: string },
    @Param() params: { postId: string },
    @Body() createCommentDto: CreateCommentPostDto,
  ) {
    const commentId: string = await this.commandBus.execute(
      new CreateCommentCommand(params.postId, createCommentDto, user),
    );

    return this.commentQueryRepository.getById(commentId);
  }
  @Public()
  @Get(':postId/comments')
  async getCommentsByPost(
    @Param('postId') postId: string,
    @Query() query: GetCommentsQueryInputDto,
  ) {
    return this.commentQueryRepository.getAll(query, postId);
  }

  @Public()
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async likeDislikePost(
    @Param() postId: postParamId,
    @Body() likeStatusDto: LikeStatusInputDto,
    @CurrentUser() user: { login: string },
  ): Promise<void> {
    await this.commandBus.execute(
      new LikeDislikePostCommand(
        postId.postId,
        user.login,
        likeStatusDto.likeStatus,
      ),
    );
  }
}
