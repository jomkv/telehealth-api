import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './api/user/user.module';
import { AuthModule } from './api/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ENV_VARS } from './shared/env-variables';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: ENV_VARS.jwtSecret(),
      signOptions: {
        expiresIn: '7d',
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
