import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../withAsyncErrorHandling';

export const readyzRequestHandler: RequestHandler = ((): RequestHandler => {
  return withAsyncErrorHandling(async (req, res) => {
    return res.status(200).json({
      ready: true,
    });
  });
})();
