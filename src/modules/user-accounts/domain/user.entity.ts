import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateUserDomainDto } from './dto/create-user.damain.dto';
import { NotFoundException } from '@nestjs/common';

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: Boolean, default: false })
  isEmailConfirmed: boolean;

  get getIsEmailConfirmed(): boolean {
    return this.isEmailConfirmed;
  }

  @Prop({ type: String, required: false, default: '' })
  confirmationCode: string;

  get getConfirmationCode(): string {
    return this.confirmationCode;
  }

  @Prop({ type: String, required: false, default: '' })
  recoveryCode: string;

  get getRecoveryCode(): string {
    return this.recoveryCode;
  }

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  get getId(): string {
    return this._id.toString();
  }

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.login = dto.login;
    user.isEmailConfirmed = false;

    return user as UserDocument;
  }

  makeEmailConfirmed() {
    if (this.isEmailConfirmed) {
      throw new Error('Entity already EmailConfirmed');
    }

    this.isEmailConfirmed = true;
  }

  setConfirmationCode(confirmationCode: string) {
    this.confirmationCode = confirmationCode;
  }

  setRecoveryCode(recoveryCode: string) {
    this.recoveryCode = recoveryCode;
  }

  updatePassword(passwordHash: string) {
    this.passwordHash = passwordHash;
  }

  clearRecoveryCode() {
    this.recoveryCode = '';
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new NotFoundException();
    }
    this.deletedAt = new Date();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
//load class methods to the shema
UserSchema.loadClass(User);
//types
export type UserDocument = HydratedDocument<User>;
//types model + static methods
export type UserModelType = Model<UserDocument> & typeof User;
