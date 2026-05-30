import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from 'src/api/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class ConsultationScheduler {
  private readonly logger = new Logger(ConsultationScheduler.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateConsultationStatuses() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // PENDING → DONE (overdue)
    const pendingToDone = await this.prisma.consultation.findMany({
      where: { status: 'PENDING', scheduledAt: { lte: oneHourAgo } },
      select: {
        id: true,
        patient: { select: { userId: true } },
        doctor: { select: { userId: true } },
      },
    });
    if (pendingToDone.length) {
      await this.prisma.consultation.updateMany({
        where: { id: { in: pendingToDone.map((c) => c.id) } },
        data: { status: 'DONE' },
      });
    }
    this.logger.log(`[PENDING -> DONE] updated=${pendingToDone.length}`);

    // PENDING → ONGOING
    const pendingToOngoing = await this.prisma.consultation.findMany({
      where: { status: 'PENDING', scheduledAt: { lte: now, gt: oneHourAgo } },
      select: {
        id: true,
        patient: { select: { userId: true } },
        doctor: { select: { userId: true } },
      },
    });
    if (pendingToOngoing.length) {
      await this.prisma.consultation.updateMany({
        where: { id: { in: pendingToOngoing.map((c) => c.id) } },
        data: { status: 'ONGOING' },
      });
      await this.notificationService.createNotifications(
        pendingToOngoing.flatMap((c) => [
          {
            userId: c.patient.userId,
            title: 'Consultation Starting',
            body: 'Your consultation is now starting.',
          },
          {
            userId: c.doctor.userId,
            title: 'Consultation Starting',
            body: 'Your consultation is now starting.',
          },
        ]),
      );
    }
    this.logger.log(`[PENDING -> ONGOING] updated=${pendingToOngoing.length}`);

    // ONGOING → DONE
    const ongoingToDone = await this.prisma.consultation.findMany({
      where: { status: 'ONGOING', scheduledAt: { lte: oneHourAgo } },
      select: {
        id: true,
        patient: { select: { userId: true } },
        doctor: { select: { userId: true } },
      },
    });
    if (ongoingToDone.length) {
      await this.prisma.consultation.updateMany({
        where: { id: { in: ongoingToDone.map((c) => c.id) } },
        data: { status: 'DONE' },
      });
      await this.notificationService.createNotifications(
        ongoingToDone.flatMap((c) => [
          {
            userId: c.patient.userId,
            title: 'Consultation Done',
            body: 'Your consultation finished just now.',
          },
          {
            userId: c.doctor.userId,
            title: 'Consultation Done',
            body: 'Your consultation finished just now.',
          },
        ]),
      );
    }
    this.logger.log(`[ONGOING -> DONE] updated=${ongoingToDone.length}`);
  }
}
