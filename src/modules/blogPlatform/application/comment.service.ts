import { Injectable } from '@nestjs/common';
import { CommentRepository } from '../infastructure/comment.repository';
import { CreateCommentDto } from '../domain/dto/create-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../domain/comment.entity';
import type { CommentModelType } from '../domain/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private readonly CommentRepository: CommentRepository,
  ) {}

  async createComment(dto: CreateCommentDto): Promise<string> {
    const comment = this.CommentModel.createInstance(dto);

    await this.CommentRepository.save(comment);

    return comment.getId;
  }
}
