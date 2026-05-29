import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConsultationScheduler {
  private readonly logger = new Logger(ConsultationScheduler.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async updateConsultationStatuses() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // PENDING → DONE (overdue pending consultations)
    const pendingToDoneResult = await this.prisma.consultation.updateMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: oneHourAgo },
      },
      data: { status: 'DONE' },
    });
    this.logger.log(`[PENDING -> DONE] updated=${pendingToDoneResult.count}`);

    // PENDING → ONGOING
    const pendingToOngoingResult = await this.prisma.consultation.updateMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: now },
      },
      data: { status: 'ONGOING' },
    });
    this.logger.log(
      `[PENDING -> ONGOING] updated=${pendingToOngoingResult.count}`,
    );

    // ONGOING → DONE
    const ongoingToDoneResult = await this.prisma.consultation.updateMany({
      where: {
        status: 'ONGOING',
        scheduledAt: { lte: oneHourAgo },
      },
      data: { status: 'DONE' },
    });
    this.logger.log(`[ONGOING -> DONE] updated=${ongoingToDoneResult.count}`);
  }
}
