import { Request } from 'express';

const primitiveAuth = (req: Request, SECRET: string): boolean =>
  req.headers.authorization === `Bearer ${SECRET}`;
export default primitiveAuth;
