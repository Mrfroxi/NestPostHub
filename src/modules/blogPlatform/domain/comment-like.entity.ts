import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

export type LikeStatus = 'Like' | 'Dislike' | 'None';

@Schema({ timestamps: true })
export class CommentLike {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  commentId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  status: LikeStatus;

  createdAt: Date;

  @Prop({ type: Date, required: true })
  addedAt: Date;

  updatedAt: Date;
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

export type CommentLikeDocument = HydratedDocument<CommentLike>;
export type CommentLikeModelType = Model<CommentLikeDocument>;
