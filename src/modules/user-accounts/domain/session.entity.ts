import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Session {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  deviceName: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  iat: string;

  @Prop({ type: String, required: true })
  exp: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
//load class methods to the shema
SessionSchema.loadClass(Session);
//types
export type SessionDocument = HydratedDocument<Session>;
//types model + static methods
export type SessionModelType = Model<SessionDocument> & typeof Session;
