import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { userRepository } from '../../database/user.repo';
import { tokenService } from '../../../services/token.service';

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

    // Access token -> response body
    const accessToken = tokenService.generateAccessToken(user);

    // Refresh token (JWT) -> cookie httpOnly
    const refreshToken = await tokenService.generateRefreshToken(user.id, user.role);

    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      path: "/",
      // domain: isSecure ? ".nongsanviet.site" : undefined, // Removed hardcoded domain to support vercel.app frontend
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Clear legacy role cookie if it exists (must match the old domain and path)
    res.clearCookie("role", {
      path: "/",
      domain: isSecure ? ".nongsanviet.site" : undefined,
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        accessToken,
      }
    });
  }
);
