import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Blog from '@src/module/blog/domain/blog.entity';
import Post from '@src/module/blog/domain/post.entity';
import Comment from '@src/module/blog/domain/comment.entity';
import { BlogRepository } from '@src/module/blog/infrastructure/blog.repository';
import { BlogQueryRepository } from '@src/module/blog/infrastructure/query/blog.query-repository';
import { PostRepository } from '@src/module/blog/infrastructure/post.repository';
import { PostQueryRepository } from '@src/module/blog/infrastructure/query/post.query-repository';
import { CommentRepository } from '@src/module/blog/infrastructure/comment.repository';
import { CommentQueryRepository } from '@src/module/blog/infrastructure/query/comment.query-repository';
import { BlogsController } from '@src/module/blog/api/blogs.controller';
import { PostsController } from '@src/module/blog/api/posts.controller';
import { CreateCommentUseCase } from '@src/module/blog/application/useCases/create-comment.usecase';
import { UserAccountsModule } from '@src/module/user-accounts/user-accounts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, Post, Comment]), UserAccountsModule],
  controllers: [BlogsController, PostsController],
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
    PostQueryRepository,
    CommentRepository,
    CommentQueryRepository,
    CreateCommentUseCase,
  ],
})
export class BlogModule {}
