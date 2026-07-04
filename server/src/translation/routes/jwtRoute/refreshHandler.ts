import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { tokenService } from '../../../services/token.service';
import { userRepository } from '../../database/user.repo';

export const refreshHandler: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: 'Refresh token not found' });
      return;
    }

    // 1. Verify refresh token (check signature & database)
    const verified = await tokenService.verifyRefreshToken(refreshToken);

    if (!verified) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
        sameSite: (req.secure || req.headers["x-forwarded-proto"] === "https") ? "none" : "lax",
        path: "/",
      });
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    // Lấy thông tin user hiện tại (để tạo access token mới với info mới nhất nếu cần)
    const user = await userRepository.getUserById(verified.userId);
    if (!user) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
        sameSite: (req.secure || req.headers["x-forwarded-proto"] === "https") ? "none" : "lax",
        path: "/",
      });
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // 2. Rotate refresh token
    const { newRefreshToken } = await tokenService.rotateRefreshToken(
      refreshToken,
      verified.userId,
      user.role
    );

    // 3. Generate new access token
    const newAccessToken = tokenService.generateAccessToken(user);

    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";

    // 4. Set new cookies and return
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      }
    });
  }
);
