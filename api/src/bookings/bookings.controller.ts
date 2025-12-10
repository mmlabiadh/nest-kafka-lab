import { Body, Controller, Get, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  create(
    @Body()
    body: {
      guestUserId: string;
      listingPublicId: string;
      checkInDate: string;
      checkOutDate: string;
      totalPriceCents: number;
    },
  ) {
    return this.bookings.create(body);
  }

  @Get()
  findAll() {
    return this.bookings.findAll();
  }
}
