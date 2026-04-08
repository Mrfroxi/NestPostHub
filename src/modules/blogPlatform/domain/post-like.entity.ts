import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

export type LikeStatus = 'Like' | 'Dislike' | 'None';

@Schema({ timestamps: true })
export class PostLike {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  status: LikeStatus;

  createdAt: Date;

  @Prop({ type: Date, required: true })
  addedAt: Date;

  updatedAt: Date;

  static createInstance(dto): PostLikeDocument {
    const postLike = new this();
    postLike.postId = dto.postId;
    postLike.userId = dto.userId;
    postLike.status = dto.status;

    return postLike as PostLikeDocument;
  }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

PostLikeSchema.loadClass(PostLike);

export type PostLikeDocument = HydratedDocument<PostLike>;

export type PostLikeModelType = Model<PostLikeDocument>;
