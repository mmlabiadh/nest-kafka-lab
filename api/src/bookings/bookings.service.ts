import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './booking.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  create(input: {
    guestUserId: string;
    listingPublicId: string;
    checkInDate: string;
    checkOutDate: string;
    totalPriceCents: number;
  }) {
    return this.bookingModel.create({ ...input, status: 'CREATED' });
  }

  findAll() {
    return this.bookingModel.find().sort({ createdAt: -1 }).lean();
  }
}
