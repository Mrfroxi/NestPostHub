import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogInputDto } from '../../../api/dto/input/create-blog.input.dto';
import {
  Blog,
  BlogDocument,
  type BlogModelType,
} from '../../../domain/blog.entity';
import { BlogRepository } from '../../../infastructure/blog.repository';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  string
> {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private blogRepository: BlogRepository,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<string> {
    const blog: BlogDocument = this.BlogModel.createInstance(dto);

    await this.blogRepository.save(blog);

    return blog.getId;
  }
}
