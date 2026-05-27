import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';
import { AvailabilityRowDto } from './dto/availability-row.dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getByDoctor(doctorId: string) {
    const rows = await this.prisma.availabilityTemplate.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return rows;
  }

  async upsertTemplate(doctorId: string, dto: UpsertAvailabilityDto) {
    this.validateRows(dto.availability);

    const [, created] = await this.prisma.$transaction([
      this.prisma.availabilityTemplate.deleteMany({ where: { doctorId } }), // Clear old values
      this.prisma.availabilityTemplate.createMany({
        data: dto.availability.map((row) => ({ ...row, doctorId })), // Replenish with updated values
      }),
    ]);

    return { count: created.count };
  }

  private validateRows(rows: AvailabilityRowDto[]) {
    // Check for duplicate days by converting to set
    const days = rows.map((r) => r.dayOfWeek);
    if (new Set(days).size !== days.length) {
      throw new BadRequestException('Duplicate days in submission');
    }

    // Check validity of start and end times
    for (const row of rows) {
      const start = parseInt(row.startTime.split(':')[0], 10);
      const end = parseInt(row.endTime.split(':')[0], 10);

      if (end <= start) {
        throw new BadRequestException(
          `${row.dayOfWeek}: endTime must be after startTime`,
        );
      }

      if (end - start < 1) {
        throw new BadRequestException(
          `${row.dayOfWeek}: minimum availability window is 1 hour`,
        );
      }
    }
  }
}
