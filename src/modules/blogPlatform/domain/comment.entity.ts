import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotFoundException } from '@nestjs/common';

@Schema({ timestamps: true })
export class Comment {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: Object, required: true })
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  createdAt: Date;

  updatedAt: Date;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  get getId(): string {
    return this._id.toString();
  }

  static createInstance(dto: CreateCommentDto): CommentDocument {
    const comment = new this();
    comment.content = dto.content;
    comment.postId = dto.postId;
    comment.commentatorInfo = dto.commentatorInfo;

    return comment as CommentDocument;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new NotFoundException();
    }
    this.deletedAt = new Date();
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> & typeof Comment;
