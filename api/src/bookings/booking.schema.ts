import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true })
  guestUserId: string;

  @Prop({ required: true })
  listingPublicId: string;

  @Prop({ required: true })
  checkInDate: string; // ISO "YYYY-MM-DD"

  @Prop({ required: true })
  checkOutDate: string;

  @Prop({ required: true })
  totalPriceCents: number;

  @Prop({ default: 'CREATED' })
  status: 'CREATED' | 'CONFIRMED' | 'CANCELED';
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
