import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';

export const logoutHandler: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    // Clear the accessToken cookie
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }
);
