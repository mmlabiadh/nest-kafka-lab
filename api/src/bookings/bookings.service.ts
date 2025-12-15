import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './booking.schema';
import { randomUUID } from 'crypto';
import { KafkaProducer } from 'src/kafka/kafka.producer';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly kafka: KafkaProducer,
  ) {}

  async create(input: {
    guestUserId: string;
    listingPublicId: string;
    checkInDate: string;
    checkOutDate: string;
    totalPriceCents: number;
  }) {
    const booking = await this.bookingModel.create({
      ...input,
      status: 'CREATED',
    });

    const topic = process.env.KAFKA_BOOKINGS_TOPIC ?? 'bookings.events';
    const bookingId = booking._id.toString();

    const event = {
      eventId: randomUUID(),
      type: 'BookingCreated',
      bookingId,
      occurredAt: new Date().toISOString(),
      payload: {
        guestUserId: booking.guestUserId,
        listingPublicId: booking.listingPublicId,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalPriceCents: booking.totalPriceCents,
      },
    };

    await this.kafka.publish(topic, bookingId, event);

    return booking;
  }

  findAll() {
    return this.bookingModel.find().sort({ createdAt: -1 }).lean();
  }
}
