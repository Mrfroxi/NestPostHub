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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [BlogController, PostController],
  providers: [
    BlogService,
    BlogRepository,
    BlogQueryRepository,
    PostService,
    PostRepository,
    PostQueryRepository,
  ],
})
export class BlogPlatformModule {}
