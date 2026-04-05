export const JwtConstants = {
  refreshTokenCookieExpiration: () => {
    const hour = 60 * 1000 * 60;
    return hour * 15;
  },
  accessTokenCookieExpiration: () => {
    return 60 * 1000 * 15;
  },
  expiresIn: '15m',
  refreshTokenExpiresIn: '15h',
} as const;
