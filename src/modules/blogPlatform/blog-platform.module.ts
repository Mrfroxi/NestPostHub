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
import { CommentQueryRepository } from './infastructure/query/comment.query.repository';
import { CommentController } from './api/comment.controller';
import { CommentService } from './application/comment.service';
import { CommentRepository } from './infastructure/comment.repository';
import { CreateBlogUseCase } from './application/useCases/blog/create-blog-command';
import { UpdateBlogUseCase } from './application/useCases/blog/update-blog-command';
import { DeleteBlogUseCase } from './application/useCases/blog/delete-blog-command';
import { CreatePostByBlogUseCase } from './application/useCases/blog/create-post-by-blog-command';
import { CreatePostUseCase } from './application/useCases/post/create-post-command';
import { UpdatePostUseCase } from './application/useCases/post/update-post-command';
import { DeletePostUseCase } from './application/useCases/post/delete-post-command';
import { CreateCommentUseCase } from './application/useCases/post/create-comment-command';

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
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
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
  ],
})
export class BlogPlatformModule {}
