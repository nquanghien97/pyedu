import * as jwt from 'jsonwebtoken';
import { ENV_VARS } from '../config/env';
import { BasicUser } from '../entities/user';
import { prisma } from '../translation/database/prisma';

export const tokenService = {
  // Access Token (thời gian sống ngắn: 15 phút)
  generateAccessToken(user: BasicUser): string {
    return jwt.sign(
      {
        user, // Contains id, email, role, name, etc.
      },
      ENV_VARS.jwtSecret,
      {
        algorithm: 'HS256',
        expiresIn: '15m',
      }
    );
  },

  // Refresh Token (thời gian sống dài: 7 ngày)
  async generateRefreshToken(userId: number, role: string): Promise<string> {
    // Tạo JWT payload chứa userId và role
    const tokenString = jwt.sign(
      { 
        userId, 
        role,
        jti: crypto.randomUUID()
      },
      ENV_VARS.jwtRefreshSecret,
      {
        algorithm: 'HS256',
        expiresIn: '7d',
      }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Lưu vào database
    await prisma.refreshToken.create({
      data: {
        id: crypto.randomUUID(),
        token: tokenString,
        userId: userId,
        expiresAt,
        isRevoked: false,
      },
    });

    return tokenString;
  },

  // Verify Refresh Token
  async verifyRefreshToken(token: string): Promise<{ userId: number, role: string } | null> {
    try {
      // 1. Verify JWT signature
      const decoded = jwt.verify(token, ENV_VARS.jwtRefreshSecret) as { userId: number, role: string };

      // 2. Kiểm tra trong DB xem token có tồn tại và chưa bị revoke không
      const dbToken = await prisma.refreshToken.findUnique({
        where: { token },
      });

      if (!dbToken || dbToken.isRevoked || dbToken.expiresAt < new Date()) {
        return null;
      }

      return {
        userId: decoded.userId,
        role: decoded.role,
      };
    } catch (error) {
      // Token hết hạn hoặc sai chữ ký
      return null;
    }
  },

  // Thu hồi (Revoke) một Refresh Token cụ thể
  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  },

  // Thu hồi tất cả Refresh Token của một User (ép đăng xuất tất cả thiết bị)
  async revokeAllUserTokens(userId: number): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  },

  // Xoay vòng token (Refresh Token Rotation)
  async rotateRefreshToken(oldToken: string, userId: number, role: string): Promise<{ newRefreshToken: string }> {
    // 1. Revoke token cũ
    await this.revokeRefreshToken(oldToken);

    // 2. Tạo token mới
    const newRefreshToken = await this.generateRefreshToken(userId, role);

    return { newRefreshToken };
  }
};
