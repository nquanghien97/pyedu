import { Request, RequestHandler } from 'express';
import primitiveAuth from './primitiveAuth';
import { ENV_VARS } from '../../../config/env';
import jwtAuth from './jwtAuth';
import { isNever } from '../../../utils/never';

type AuthCheck = 'internal' | 'jwt';

const isAuthenticated = async (
  authCheck: AuthCheck,
  req: Request
): Promise<boolean> => {
  switch (authCheck) {
    case 'internal':
      return primitiveAuth(req, ENV_VARS.internalAuthSecret);
    case 'jwt':
      return await jwtAuth(req);
    default:
      return isNever(authCheck);
  }
};

/**
 * Allows for one or more auth checks to be used for a route.
 */
const authMiddleware =
  (authChecks: AuthCheck | AuthCheck[]): RequestHandler =>
    async (req, res, next) => {
      const checks = Array.isArray(authChecks) ? authChecks : [authChecks];

      const authenticated = (
        await Promise.all(checks.map((check) => isAuthenticated(check, req)))
      ).every((res) => !!res);

      if (!authenticated) {
        res.status(401).json({
          outcome: 'UNAUTHENTICATED',
        });
        return;
      }

      next();
    };
export default authMiddleware;
