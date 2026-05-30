import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationGateway,
  ) {}

  async getLatestForUser(userId: string, limit = 4) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getAllForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAllReadForUser(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async createNotification(
    userId: string,
    title: string,
    body: string,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    const created = await tx.notification.create({
      data: { userId, title, body },
    });

    // emit to connected sockets for this user (best-effort)
    try {
      this.gateway.emitToUser(userId, created);
    } catch (err) {
      // swallow — emission is best-effort
    }

    return created;
  }

  async createNotifications(
    notifications: { userId: string; title: string; body: string }[],
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    if (!notifications.length) return [];

    const data = notifications.map(({ userId, title, body }) => ({
      userId,
      title,
      body,
    }));

    const created = await tx.notification.createManyAndReturn({ data });

    // emit best-effort per user
    for (const notification of created) {
      try {
        this.gateway.emitToUser(notification.userId, notification);
      } catch {
        // swallow — emission is best-effort
      }
    }

    return created;
  }
}
