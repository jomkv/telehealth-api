import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ENV_VARS } from 'src/shared/env-variables';

@Global()
@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: ENV_VARS.jwtSecret(),
      signOptions: {
        expiresIn: '7d',
      },
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, JwtService],
  exports: [AuthService, JwtService],
})
export class AuthModule {}
