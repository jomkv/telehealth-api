import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ENV_VARS } from 'src/shared/env-variables';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new Pool({
      connectionString: ENV_VARS.dbUrl(),
      max: 11, // leave headroom for 22 limit
      idleTimeoutMillis: 30000, // release idle connections after 30s
      connectionTimeoutMillis: 5000,
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  onModuleInit() {
    this.$connect()
      .then(() => console.log('DB Connected'))
      .catch((error) => console.log('Unable to conect to DB: ', error));
  }
}
