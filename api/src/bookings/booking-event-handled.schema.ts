import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BookingEventHandledDocument = HydratedDocument<BookingEventHandled>;

@Schema({ timestamps: true })
export class BookingEventHandled {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true })
  bookingId: string;

  @Prop({ required: true })
  type: string;
}

export const BookingEventHandledSchema =
  SchemaFactory.createForClass(BookingEventHandled);
