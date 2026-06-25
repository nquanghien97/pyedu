import { RequestHandler } from 'express';
import { USER_ROLE } from '../../../generated/prisma/client';

export const requireRole = (...allowedRoles: USER_ROLE[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'UNAUTHENTICATED' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
      return;
    }

    next();
  };
};
