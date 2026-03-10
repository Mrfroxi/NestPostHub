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
