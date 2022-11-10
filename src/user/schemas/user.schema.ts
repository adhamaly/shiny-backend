import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserModel = User & Document;
export const userModelName = 'user';
@Schema({ timestamps: true })
export class User {
  @Prop()
  userName: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  gender: string;

  @Prop()
  imagePath: string;

  @Prop()
  imageLink: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: [{ type: String }] })
  fcmTokens: string[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: 0 })
  walletBalance: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
