import { BasicUser } from '../../entities/user';

declare global {
  namespace Express {
    interface Request {
      user?: BasicUser;
    }
  }
}