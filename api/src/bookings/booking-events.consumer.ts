import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import {
  BookingEventHandled,
  BookingEventHandledDocument,
} from './booking-event-handled.schema';
import { Model } from 'mongoose';

interface BookingCreatedEvent {
  eventId: string;
  type: 'BookingCreated';
  bookingId: string;
  occurredAt: string;
  payload: {
    guestUserId: string;
    listingPublicId: string;
    checkInDate: string;
    checkOutDate: string;
    totalPriceCents: number;
  };
}

@Injectable()
export class BookingEventsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BookingEventsConsumer.name);
  private consumer!: Consumer;

  constructor(
    @InjectModel(BookingEventHandled.name)
    private readonly handledModel: Model<BookingEventHandledDocument>, // 👈 IMPORTANT
  ) {}

  async onModuleInit(): Promise<void> {
    const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID ?? 'bookings-api',
      brokers,
    });

    this.consumer = kafka.consumer({
      // groupId métier: c'est notre "email-service" de démo
      groupId:
        process.env.KAFKA_BOOKINGS_CONSUMER_GROUP ?? 'bookings-email-lab',
    });

    await this.consumer.connect();

    const topic = process.env.KAFKA_BOOKINGS_TOPIC ?? 'bookings.events';

    await this.consumer.subscribe({
      topic,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: (payload: EachMessagePayload) => this.handleMessage(payload),
    });

    this.logger.log(
      `BookingEventsConsumer connected to brokers=${brokers.join(',')} and subscribed to topic=${topic}`,
    );
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;

    const key = message.key?.toString() ?? null;
    const rawValue = message.value?.toString() ?? '';
    const offset = message.offset;

    this.logger.log(
      `Received message topic=${topic} partition=${partition} offset=${offset} key=${key}`,
    );

    let event: BookingCreatedEvent;

    try {
      event = JSON.parse(rawValue) as BookingCreatedEvent;
    } catch {
      this.logger.error(`Invalid JSON payload, skipping. value=${rawValue}`);
      return;
    }

    try {
      // Idempotence: eventId unique
      await this.handledModel.create({
        eventId: event.eventId,
        bookingId: event.bookingId,
        type: event.type,
      });

      // Ici ira ta vraie logique métier (email, etc.)
      this.logger.log(
        `Processed BookingCreated eventId=${event.eventId} bookingId=${event.bookingId}`,
      );
    } catch (err: unknown) {
      // Duplicate key -> event déjà traité
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code?: number }).code === 11000
      ) {
        this.logger.warn(
          `Duplicate eventId=${event.eventId} ignored (idempotent).`,
        );
        return;
      }
      this.logger.error(
        `Error while processing eventId=${event.eventId}`,
        err as Error,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.logger.log('BookingEventsConsumer disconnected');
    }
  }
}
