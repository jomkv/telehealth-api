export const ENV_VARS = {
  env: () => process.env.NODE_ENV,
  isProd: () => process.env.NODE_ENV === 'production',
  isDev: () => process.env.NODE_ENV !== 'production',
  jwtSecret: () => process.env.JWT_SECRET,
  encryptionSecret: () => process.env.ENCRYPTION_SECRET,
  baseUrl: () => process.env.BASE_URL,
  clientUrl: () => process.env.CLIENT_URL,
  dbUrl: () => process.env.DATABASE_URL,
};
