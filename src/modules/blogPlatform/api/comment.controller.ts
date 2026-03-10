import { Controller, Get, Param } from '@nestjs/common';
import { CommentQueryRepository } from '../infastructure/query/comment.query.repository';

@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentQueryRepository: CommentQueryRepository,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.commentQueryRepository.getById(id);
  }
}
