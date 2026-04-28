import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { userRepository } from '../../database/user.repo';
import { USER_ROLE } from '../../../generated/prisma/client';

// Middleware: chỉ cho phép ADMIN truy cập
export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Forbidden: Admin only' });
    return;
  }
  next();
};

// GET /api/v1/admin/stats
export const getDashboardStats: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const stats = await userRepository.countByRole();

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);

// GET /api/v1/admin/users?page=1&limit=10&role=STUDENT&search=keyword
export const getAllUsers: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as USER_ROLE | undefined;
    const search = req.query.search as string | undefined;

    // Validate role if provided
    if (role && !Object.values(USER_ROLE).includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role' });
      return;
    }

    const result = await userRepository.getAllUsers({ page, limit, role, search });

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }
);

// POST /api/v1/admin/users
export const createUser: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, password, role',
      });
      return;
    }

    if (!Object.values(USER_ROLE).includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role' });
      return;
    }

    // Kiểm tra email trùng
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already exists' });
      return;
    }

    const newUser = await userRepository.createUser({ name, email, password, role });

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  }
);

// PUT /api/v1/admin/users/:id
export const updateUser: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid user ID' });
      return;
    }

    const { name, email, role, password } = req.body;

    if (role && !Object.values(USER_ROLE).includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role' });
      return;
    }

    // Kiểm tra user tồn tại
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Kiểm tra email trùng (nếu đổi email)
    if (email && email !== existingUser.email) {
      const emailUser = await userRepository.getUserByEmail(email);
      if (emailUser) {
        res.status(409).json({ success: false, message: 'Email already exists' });
        return;
      }
    }

    const updatedUser = await userRepository.updateUser(id, { name, email, role, password });

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  }
);

// DELETE /api/v1/admin/users/:id
export const deleteUser: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid user ID' });
      return;
    }

    // Không cho phép xoá chính mình
    if (req.user && req.user.id === id) {
      res.status(400).json({ success: false, message: 'Cannot delete yourself' });
      return;
    }

    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    await userRepository.deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  }
);
