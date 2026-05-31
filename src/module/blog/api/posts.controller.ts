import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostQueryRepository } from '@src/module/blog/infrastructure/query/post.query-repository';
import { GetPostsQueryInputDto } from '@src/module/blog/api/input-dto/get-posts-query.input-dto';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

@Controller('posts')
export class PostsController {
  constructor(private postQueryRepository: PostQueryRepository) {}

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
}