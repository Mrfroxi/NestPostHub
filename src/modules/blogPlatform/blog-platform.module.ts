import { Module } from '@nestjs/common';
import { BlogController } from './api/blog.controller';
import { BlogService } from './application/blog.service';
import { BlogRepository } from './infastructure/blog.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './domain/blog.entity';
import { BlogQueryRepository } from './infastructure/query/blog.query.repository';
import { Post, PostSchema } from './domain/post.entity';
import { PostController } from './api/post.controller';
import { PostService } from './application/post.service';
import { PostRepository } from './infastructure/post.repository';
import { PostQueryRepository } from './infastructure/query/post.query.repository';
import { Comment, CommentSchema } from './domain/comment.entity';
import { PostLike, PostLikeSchema } from './domain/post-like.entity';
import { CommentLike, CommentLikeSchema } from './domain/comment-like.entity';
import { CommentQueryRepository } from './infastructure/query/comment.query.repository';
import { CommentController } from './api/comment.controller';
import { CommentService } from './application/comment.service';
import { CommentRepository } from './infastructure/comment.repository';
import { CommentLikeRepository } from './infastructure/comment-like.repository';
import { LikeDislikePostUseCase } from './application/useCases/post/like-dislike-post-command';
import { LikeDislikeCommentUseCase } from './application/useCases/comment/like-dislike-comment-command';
import { DeleteCommentUseCase } from './application/useCases/comment/delete-comment-command';
import { UpdateCommentUseCase } from './application/useCases/comment/update-comment-command';
import { CreateBlogUseCase } from './application/useCases/blog/create-blog-command';
import { UpdateBlogUseCase } from './application/useCases/blog/update-blog-command';
import { DeleteBlogUseCase } from './application/useCases/blog/delete-blog-command';
import { CreatePostByBlogUseCase } from './application/useCases/blog/create-post-by-blog-command';
import { UpdatePostUseCase } from './application/useCases/post/update-post-command';
import { DeletePostUseCase } from './application/useCases/post/delete-post-command';
import { CreateCommentUseCase } from './application/useCases/post/create-comment-command';
import { CreatePostUseCase } from './application/useCases/post/create-post-command';
import { PostLikeRepository } from './infastructure/post-like.repository';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { JwtModule } from '@nestjs/jwt';

const blogCommandHandlers = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostByBlogUseCase,
];

const postCommandHandlers = [
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreateCommentUseCase,
  LikeDislikePostUseCase,
  LikeDislikeCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
];

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
    UserAccountsModule,
  ],
  controllers: [BlogController, PostController, CommentController],
  providers: [
    ...blogCommandHandlers,
    ...postCommandHandlers,
    BlogService,
    BlogRepository,
    BlogQueryRepository,
    PostService,
    PostRepository,
    PostQueryRepository,
    CommentService,
    CommentRepository,
    CommentQueryRepository,
    CommentLikeRepository,
    PostLikeRepository,
  ],
})
export class BlogPlatformModule {}
