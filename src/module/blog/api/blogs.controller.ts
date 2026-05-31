import { Controller, Get, Param } from '@nestjs/common';
import { BlogIdParamDto } from '@src/module/blog/api/input-dto/blog-id.param-dto';
import {
  BlogOutputDto,
  BlogQueryRepository,
} from '@src/module/blog/infrastructure/query/blog.query-repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

@Controller('blogs')
export class BlogsController {
  constructor(private blogQueryRepository: BlogQueryRepository) {}

  @Get(':id')
  async getBlogById(@Param() params: BlogIdParamDto): Promise<BlogOutputDto> {
    const blog: BlogOutputDto | null = await this.blogQueryRepository.findById(
      params.id,
    );

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    return blog;
  }
}
