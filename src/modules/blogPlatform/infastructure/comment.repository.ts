import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../domain/comment.entity';
import type { CommentModelType } from '../domain/comment.entity';

@Injectable()
export class CommentRepository {
  constructor(@InjectModel(Comment.name) private CommentModel: CommentModelType) {}

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async findOrNotFoundFail(id: string): Promise<CommentDocument> {
    const comment: CommentDocument | null = await this.CommentModel.findById(id);

    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }
}
