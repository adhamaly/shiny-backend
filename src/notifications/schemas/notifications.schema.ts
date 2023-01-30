import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User, userModelName } from '../../user/schemas/user.schema';
import { Order, ordersModelName } from '../../orders/schemas/orders.schema';

export type NotificationsModel = Notification & Document;
export const notificationsModelName = 'notifications';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: userModelName })
  receiver: User;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, refPath: 'clickableItemModel' })
  clickableItem: Order;

  @Prop({
    type: String,
    enum: [ordersModelName],
  })
  clickableItemModel: string;

  @Prop(
    raw({
      arTitle: { type: String },
      arBody: { type: String },
      enTitle: { type: String },
      enBody: { type: String },
    }),
  )
  message: Record<string, any>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationsSchema = SchemaFactory.createForClass(Notification);
