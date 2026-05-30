import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/api/auth/guards/auth.guard';
import { Request } from 'express';

@Controller('notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('latest')
  @UseGuards(AuthGuard)
  async getLatest(@Req() req: Request) {
    const userId = req.user.id;
    return this.notificationService.getLatestForUser(userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAll(@Req() req: Request) {
    const userId = req.user.id;
    return this.notificationService.getAllForUser(userId);
  }

  @Post('mark-all-read')
  @UseGuards(AuthGuard)
  async markAllRead(@Req() req: Request) {
    const userId = req.user.id;
    const res = await this.notificationService.markAllReadForUser(userId);
    return { updated: res.count };
  }
}
