import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking, BookingSchema } from './booking.schema';
import { KafkaModule } from 'src/kafka/kafka.module';
import { BookingEventsConsumer } from './booking-events.consumer';
import {
  BookingEventHandled,
  BookingEventHandledSchema,
} from './booking-event-handled.schema';

@Module({
  imports: [
    KafkaModule,
    MongooseModule.forFeature([
      { name: BookingEventHandled.name, schema: BookingEventHandledSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingEventsConsumer],
})
export class BookingsModule {}
