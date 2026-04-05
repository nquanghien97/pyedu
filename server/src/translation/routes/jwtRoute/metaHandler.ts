import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { prisma } from '../../database/prisma';

export const getTeacherClasses: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    // Lấy danh sách lớp học từ database
    const classes = await prisma.class.findMany({
      select: { id: true, name: true },
    });
    
    // Fallback data dùng tạm nếu bảng Class trong DB chưa có dữ liệu 
    // (để bạn vẫn có thể test UI Giao bài tập cho Lớp học)
    if (classes.length === 0) {
      const mockClasses = [
        { id: 'class-10a1', name: '(Demo) Lớp 10A1 - Toán học' },
        { id: 'class-11b2', name: '(Demo) Lớp 11B2 - Vật lý' },
        { id: 'class-12a1', name: '(Demo) Lớp 12A1 - Hóa học' },
      ];
      return res.json({ success: true, data: mockClasses });
    }

    res.json({ success: true, data: classes });
  }
);

export const getTeacherStudents: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    // Fetch all real students from DB so teacher can assign to them
    const students = await prisma.student.findMany({
      include: { user: { select: { name: true, email: true } } },
    });
    const mapped = students.map((s) => ({
      id: s.id,
      name: s.user.name || s.user.email,
      email: s.user.email,
    }));
    res.json({ success: true, data: mapped });
  }
);
