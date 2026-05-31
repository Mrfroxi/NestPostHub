import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SABasicAuthGuard } from '@src/module/sa/guards/sa-basic-auth.guard';
import { CreateBlogInputDto } from '@src/module/sa/api/input-dto/create-blog.input-dto';
import { CreateBlogCommand } from '@src/module/sa/application/useCases/create-blog.usecase';
import { BlogQueryRepository } from '@src/module/blog/infrastructure/query/blog.query-repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private commandBus: CommandBus,
    private blogQueryRepository: BlogQueryRepository,
  ) {}

  @UseGuards(SABasicAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: CreateBlogInputDto) {
    const blogId: string = await this.commandBus.execute(
      new CreateBlogCommand(body),
    );

    const blog = await this.blogQueryRepository.findById(blogId);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Blog not found after creation',
        extensions: [
          { message: 'Blog not found after creation', field: 'blogId' },
        ],
      });
    }

    return blog;
  }
}
