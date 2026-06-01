import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Blog from '@src/module/blog/domain/blog.entity';
import Post from '@src/module/blog/domain/post.entity';
import Comment from '@src/module/blog/domain/comment.entity';
import CommentReaction from '@src/module/blog/domain/comment-reaction.entity';
import PostReaction from '@src/module/blog/domain/post-reaction.entity';
import { BlogRepository } from '@src/module/blog/infrastructure/blog.repository';
import { BlogQueryRepository } from '@src/module/blog/infrastructure/query/blog.query-repository';
import { PostRepository } from '@src/module/blog/infrastructure/post.repository';
import { PostReactionRepository } from '@src/module/blog/infrastructure/post-reaction.repository';
import { PostQueryRepository } from '@src/module/blog/infrastructure/query/post.query-repository';
import { CommentRepository } from '@src/module/blog/infrastructure/comment.repository';
import { CommentReactionRepository } from '@src/module/blog/infrastructure/comment-reaction.repository';
import { CommentQueryRepository } from '@src/module/blog/infrastructure/query/comment.query-repository';
import { BlogsController } from '@src/module/blog/api/blogs.controller';
import { PostsController } from '@src/module/blog/api/posts.controller';
import { CommentsController } from '@src/module/blog/api/comments.controller';
import { CreateCommentUseCase } from '@src/module/blog/application/useCases/create-comment.usecase';
import { UpdateCommentUseCase } from '@src/module/blog/application/useCases/update-comment.usecase';
import { DeleteCommentUseCase } from '@src/module/blog/application/useCases/delete-comment.usecase';
import { LikeCommentUseCase } from '@src/module/blog/application/useCases/like-comment.usecase';
import { LikePostUseCase } from '@src/module/blog/application/useCases/like-post.usecase';
import { OptionalJwtAuthGuard } from '@src/module/blog/guards/optional-jwt-auth.guard';
import { UserAccountsModule } from '@src/module/user-accounts/user-accounts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, Post, Comment, CommentReaction, PostReaction]), UserAccountsModule],
  controllers: [BlogsController, PostsController, CommentsController],
  exports: [
    BlogQueryRepository,
    BlogRepository,
    PostQueryRepository,
    PostRepository,
    CommentQueryRepository,
  ],
  providers: [
    BlogRepository,
    BlogQueryRepository,
    PostRepository,
    PostReactionRepository,
    PostQueryRepository,
    CommentRepository,
    CommentReactionRepository,
    CommentQueryRepository,
    CreateCommentUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
    LikeCommentUseCase,
    LikePostUseCase,
    OptionalJwtAuthGuard,
  ],
})
export class BlogModule {}
