import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConsultationStatus } from 'generated/prisma/client';
import { PopulatedConsultation } from 'src/shared/@types/consultation';
import { ConsultationService } from '../consultation.service';
import { Request } from 'express';

export const REQUIRE_NOT_DONE_KEY = 'requireNotDone';
export const RequireNotDone = () => SetMetadata(REQUIRE_NOT_DONE_KEY, true);

/**
 * Pre-requisite:
 * - Must have `req.params.id` and `req.user`
 *
 * What this does:
 * 1. Check if consultationId from params is existing.
 * 2. Ensure req.user is a participant of the consultation.
 * 3. Passes found consultation of type `PopulatedConsultation` onto request handler, accessible via `req.consultation`.
 */
@Injectable()
export class ConsultationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly consultationService: ConsultationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    if (!req.user) {
      throw new BadRequestException('Missing user context');
    }

    if (typeof req.params.id === 'undefined' || req.params.id === null) {
      throw new BadRequestException('Missing ID parameter');
    }

    const consultation: PopulatedConsultation | null =
      await this.consultationService.findById(req.params.id);

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    // If req.user is not a participant
    if (
      req.user.id !== consultation.doctor.userId &&
      req.user.id !== consultation.patient.userId
    ) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    const requireNotDone: boolean =
      this.reflector.getAllAndOverride<boolean>(REQUIRE_NOT_DONE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    if (
      (requireNotDone &&
        consultation.status === ConsultationStatus.CANCELLED) ||
      consultation.status === ConsultationStatus.DONE
    ) {
      throw new BadRequestException('Consultation already cancelled/done');
    }

    req.consultation = consultation;

    return true;
  }
}
