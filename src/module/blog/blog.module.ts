import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Blog from '@src/module/blog/domain/blog.entity';
import { BlogRepository } from '@src/module/blog/infrastructure/blog.repository';
import { BlogQueryRepository } from '@src/module/blog/infrastructure/query/blog.query-repository';
import { BlogsController } from '@src/module/blog/api/blogs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Blog])],
  controllers: [BlogsController],
  exports: [BlogQueryRepository, BlogRepository],
  providers: [BlogRepository, BlogQueryRepository],
})
export class BlogModule {}