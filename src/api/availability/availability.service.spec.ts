import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

const mockPrisma = {
  availabilityTemplate: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    jest.clearAllMocks();
  });

  describe('getByDoctor', () => {
    it('returns availability rows for a doctor', async () => {
      const rows = [{ dayOfWeek: 'MON', startTime: '09:00', endTime: '17:00' }];
      mockPrisma.availabilityTemplate.findMany.mockResolvedValue(rows);

      const result = await service.getByDoctor('doctor-1');

      expect(result).toEqual(rows);
      expect(mockPrisma.availabilityTemplate.findMany).toHaveBeenCalledWith({
        where: { doctorId: 'doctor-1' },
        orderBy: { dayOfWeek: 'asc' },
      });
    });

    it('returns empty array when doctor has no template', async () => {
      mockPrisma.availabilityTemplate.findMany.mockResolvedValue([]);
      const result = await service.getByDoctor('doctor-1');
      expect(result).toEqual([]);
    });
  });

  describe('upsertTemplate', () => {
    it('deletes existing rows and creates new ones in a transaction', async () => {
      mockPrisma.$transaction.mockResolvedValue([{ count: 0 }, { count: 2 }]);

      const dto = {
        availability: [
          { dayOfWeek: 'MON', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'TUE', startTime: '09:00', endTime: '17:00' },
        ],
      };

      const result = await service.upsertTemplate('doctor-1', dto as any);
      expect(result).toEqual({ count: 2 });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('accepts an empty array (doctor clears schedule)', async () => {
      mockPrisma.$transaction.mockResolvedValue([{ count: 3 }, { count: 0 }]);
      const result = await service.upsertTemplate('doctor-1', {
        availability: [],
      });
      expect(result).toEqual({ count: 0 });
    });

    it('throws on duplicate days', async () => {
      const dto = {
        availability: [
          { dayOfWeek: 'MON', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'MON', startTime: '10:00', endTime: '15:00' },
        ],
      };
      await expect(
        service.upsertTemplate('doctor-1', dto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when endTime is not after startTime', async () => {
      const dto = {
        availability: [
          { dayOfWeek: 'MON', startTime: '17:00', endTime: '09:00' },
        ],
      };
      await expect(
        service.upsertTemplate('doctor-1', dto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when endTime equals startTime', async () => {
      const dto = {
        availability: [
          { dayOfWeek: 'MON', startTime: '09:00', endTime: '09:00' },
        ],
      };
      await expect(
        service.upsertTemplate('doctor-1', dto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
