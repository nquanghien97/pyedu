import { RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { userRepository } from '../../database/user.repo';
import { ENV_VARS } from '../../../config/env';

export const loginHandler: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const user = await userRepository.loginUser(
      req.body.email,
      req.body.password
    );

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      {
        user,
      },
      ENV_VARS.jwtSecret,
      {
        algorithm: 'HS256',
        expiresIn: '24h',
      }
    );

    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      domain: isSecure ? ".nongsanviet.site" : undefined,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user,
      accessToken: token,
    });
  }
);
