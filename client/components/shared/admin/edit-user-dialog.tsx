'use client'

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateUserAdmin } from "@/services/admin";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  onSuccess: () => void;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "TEACHER", label: "Giáo viên" },
  { value: "STUDENT", label: "Học sinh" },
];

export function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword("");
    setShowPassword(false);
    setErrors({});
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    }

    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (password && password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!role) {
      newErrors.role = "Vui lòng chọn vai trò";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const updateData: Record<string, string> = {};
      if (name.trim() !== user.name) updateData.name = name.trim();
      if (email.trim() !== user.email) updateData.email = email.trim();
      if (role !== user.role) updateData.role = role;
      if (password) updateData.password = password;

      if (Object.keys(updateData).length === 0) {
        toast.info("Không có thay đổi nào");
        return;
      }

      const res = await updateUserAdmin(user.id, updateData);
      if (res.success) {
        toast.success("Cập nhật tài khoản thành công!");
        onSuccess();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật tài khoản";
      if (message.includes("409") || message.includes("already exists")) {
        setErrors({ email: "Email đã tồn tại trong hệ thống" });
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Chỉnh sửa tài khoản
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            Cập nhật thông tin người dùng. Để trống mật khẩu nếu không muốn thay đổi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
              Họ tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={errors.name ? "border-red-400 focus:ring-red-500/20" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={errors.email ? "border-red-400 focus:ring-red-500/20" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700">
              Vai trò <span className="text-red-500">*</span>
            </Label>
            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value);
                if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
              }}
            >
              <SelectTrigger className={`w-full ${errors.role ? "border-red-400" : ""}`}>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Password (Optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-password" className="text-sm font-medium text-gray-700">
              Mật khẩu mới <span className="text-gray-400 text-xs font-normal">(để trống nếu không đổi)</span>
            </Label>
            <div className="relative">
              <Input
                id="edit-password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={`pr-10 ${errors.password ? "border-red-400 focus:ring-red-500/20" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Huỷ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Đang lưu...
              </div>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
