import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Role } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPayload } from 'src/shared/@types/user';
import { verifyAccessToken } from 'src/shared/auth-utils';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const ONBOARDED_KEY = 'onboardedPolicy';
export type OnboardedPolicy = 'onboarded' | 'unonboarded' | 'any';
export const UnonboardedOnly = () => SetMetadata(ONBOARDED_KEY, 'unonboarded');
export const AllowAnyOnboarding = () => SetMetadata(ONBOARDED_KEY, 'any');

/**
 * What this does:
 * 1. Protect endpoint(s) by ensuring there is a valid auth cookie.
 * 2. Optional RBAC via `@Roles` decorator, can pass in specific role(s) to further protect endpoint(s).
 * 3. Passes found user of type `UserPayload` onto request handler, accessible via `req.user`.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const token = req?.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    let payload: { id?: string };

    try {
      payload = await verifyAccessToken(this.jwtService, token);
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    const userId = payload.id;

    if (!userId) {
      throw new UnauthorizedException('Invalid access token');
    }

    const user: UserPayload | null = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isOnboarded: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    req.user = user;

    const onboardedPolicy =
      this.reflector.getAllAndOverride<OnboardedPolicy>(ONBOARDED_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'onboarded';

    // Only check isOnboarded status if policy is not "any"
    if (onboardedPolicy !== 'any') {
      if (onboardedPolicy === 'onboarded' && !user.isOnboarded) {
        throw new ForbiddenException('User not onboarded');
      }

      if (onboardedPolicy === 'unonboarded' && user.isOnboarded) {
        throw new ForbiddenException('User already onboarded');
      }
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
