import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducer.name);
  private producer!: Producer;

  async onModuleInit() {
    const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID ?? 'app',
      brokers,
    });

    this.producer = kafka.producer();
    await this.producer.connect();

    this.logger.log(`Kafka producer connected to brokers=${brokers.join(',')}`);
  }

  async publish(topic: string, key: string, payload: unknown) {
    const value = JSON.stringify(payload);

    const record = {
      topic,
      messages: [{ key, value }],
    };

    const result = await this.producer.send(record);

    // result = tableau de "record metadata" par topic
    for (const r of result) {
      // r.topicName, r.partition, r.baseOffset
      this.logger.log(
        `Published message to topic=${r.topicName} partition=${r.partition} baseOffset=${r.baseOffset} key=${key}`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
      this.logger.log('Kafka producer disconnected');
    }
  }
}
