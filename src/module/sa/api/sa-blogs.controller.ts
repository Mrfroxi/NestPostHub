import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SABasicAuthGuard } from '@src/module/sa/guards/sa-basic-auth.guard';
import { CreateBlogInputDto } from '@src/module/sa/api/input-dto/create-blog.input-dto';
import { UpdateBlogInputDto } from '@src/module/sa/api/input-dto/update-blog.input-dto';
import { CreateBlogCommand } from '@src/module/sa/application/useCases/create-blog.usecase';
import { UpdateBlogCommand } from '@src/module/sa/application/useCases/update-blog.usecase';
import { DeleteBlogCommand } from '@src/module/sa/application/useCases/delete-blog.usecase';
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

  @UseGuards(SABasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @UseGuards(SABasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }
}
