import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserModel = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop()
  userName: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: [{ type: String }] })
  fcmTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
