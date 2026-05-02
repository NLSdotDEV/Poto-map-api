function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const JwtConstants = {
  refreshTokenCookieExpiration: () => {
    const day = 60 * 1000 * 60 * 24;
    return day * 30;
  },
  accessTokenCookieExpiration: () => {
    return 60 * 1000 * 15;
  },
  expiresIn: '15m',
  refreshTokenExpiresIn: '30d',
  get accessSecret() {
    return requireEnv('JWT_ACCESS_SECRET');
  },
  get refreshSecret() {
    return requireEnv('JWT_REFRESH_SECRET');
  },
} as const;
