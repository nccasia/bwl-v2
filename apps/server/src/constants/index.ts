import { SecurityOptions } from './security-ptions';

export const GLOBAL_PREFIX = 'v1';
export const CACHES = {
  LOCKOUT_SESSION: {
    getKey: (userId: string) => `LOCKOUT_SESSION:${userId}`,
  },

  OTP_SESSION: {
    getKey: (userId: string) => `OTP_SESSION:${userId}`,
    expiredTime: SecurityOptions.OTP_EXPIRATION_TIME,
  },

  REVOKED_TOKENS: {
    getKey: (tokenId: string) => `REVOKED_TOKEN:${tokenId}`,
    expiredTime: (expiresIn: number) => expiresIn,
  },
};
export * from './login-error-codes';
export * from './security-ptions';

