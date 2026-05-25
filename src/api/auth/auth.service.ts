import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { User } from 'generated/prisma/client';
import { ENV_VARS } from 'src/shared/env-variables';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * @param {string} inputPassword - Input password (plaintext) from user
   * @param {string} userPassword - Hashed password from DB, source of truth
   * @returns {Promise<boolean>} True if passwords match, false if not
   */
  async isPasswordCorrect(
    inputPassword: string,
    userPassword: string,
  ): Promise<boolean> {
    return await compare(inputPassword, userPassword);
  }

  async generateAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      { id: user.id },
      { secret: ENV_VARS.jwtSecret() },
    );
  }
}
