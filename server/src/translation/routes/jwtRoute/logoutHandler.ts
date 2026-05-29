import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { tokenService } from '../../../services/token.service';

export const logoutHandler: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Revoke the token in the database
      await tokenService.revokeRefreshToken(refreshToken);
    }

    // Clear cookies
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: (req.secure || req.headers["x-forwarded-proto"] === "https") ? "none" : "lax",
      path: "/",
    });
    
    // Đảm bảo clear cookie cũ nếu có
    res.clearCookie('accessToken');

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }
);
