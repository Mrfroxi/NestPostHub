import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Blog from '@src/module/blog/domain/blog.entity';
import Post from '@src/module/blog/domain/post.entity';
import { BlogRepository } from '@src/module/blog/infrastructure/blog.repository';
import { BlogQueryRepository } from '@src/module/blog/infrastructure/query/blog.query-repository';
import { PostRepository } from '@src/module/blog/infrastructure/post.repository';
import { PostQueryRepository } from '@src/module/blog/infrastructure/query/post.query-repository';
import { BlogsController } from '@src/module/blog/api/blogs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, Post])],
  controllers: [BlogsController],
  exports: [BlogQueryRepository, BlogRepository, PostQueryRepository, PostRepository],
  providers: [BlogRepository, BlogQueryRepository, PostRepository, PostQueryRepository],
})
export class BlogModule {}