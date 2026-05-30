import { JwtService } from '@nestjs/jwt';
import { ENV_VARS } from './env-variables';

export function parseAccessTokenFromCookie(
  cookieHeader: string,
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map((p) => p.trim());
  for (const p of parts) {
    if (p.startsWith('access_token=')) {
      return decodeURIComponent(p.split('=')[1] || '');
    }
  }
  return null;
}

export async function verifyAccessToken(jwtService: JwtService, token: string) {
  // will throw if invalid
  return jwtService.verifyAsync(token, { secret: ENV_VARS.jwtSecret() });
}
