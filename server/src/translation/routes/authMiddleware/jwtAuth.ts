import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { logger } from '../../../lib/logger';
import { ENV_VARS } from '../../../config/env';
import { BasicUser } from '../../../entities/user';

const verifyToken = async (
  token: string
): Promise<{ ok: boolean; user?: BasicUser }> => {
  try {
    const result = jwt.decode(token, { complete: true });

    jwt.verify(token, ENV_VARS.jwtSecret, {
      algorithms: ['HS256'],
    });

    if (typeof result?.payload === 'string') {
      throw new Error('JWT payload undefined');
    }

    return {
      user: result?.payload.user as BasicUser,
      ok: true,
    };
  } catch (err) {
    logger.error('Failed to verify jwt token', err);
    return {
      ok: false,
    };
  }
};

const jwtAuth = async (req: Request): Promise<boolean> => {
  // Đọc từ Authorization header (Access Token)
  const headerToken = req.headers['authorization']?.split('Bearer ')?.[1];

  const token = headerToken;

  if (!token) {
    return false;
  }

  const verifiedToken = await verifyToken(token);

  if (verifiedToken.ok) {
    req.user = verifiedToken.user;
  }

  return verifiedToken.ok;
};

export default jwtAuth;
