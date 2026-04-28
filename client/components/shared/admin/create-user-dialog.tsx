'use client'

import { useState } from "react";
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
import { createUserAdmin } from "@/services/admin";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "TEACHER", label: "Giáo viên" },
  { value: "STUDENT", label: "Học sinh" },
];

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
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
      const res = await createUserAdmin({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (res.success) {
        toast.success("Tạo tài khoản thành công!");
        resetForm();
        onSuccess();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể tạo tài khoản";
      if (message.includes("409") || message.includes("already exists")) {
        setErrors({ email: "Email đã tồn tại trong hệ thống" });
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("");
    setShowPassword(false);
    setErrors({});
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Tạo tài khoản mới
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            Nhập thông tin để tạo tài khoản người dùng mới trên hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="create-name" className="text-sm font-medium text-gray-700">
              Họ tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-name"
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
            <Label htmlFor="create-email" className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-email"
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

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="create-password" className="text-sm font-medium text-gray-700">
              Mật khẩu <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="create-password"
                type={showPassword ? "text" : "password"}
                placeholder="Ít nhất 6 ký tự"
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

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="create-role" className="text-sm font-medium text-gray-700">
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
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
                Đang tạo...
              </div>
            ) : (
              "Tạo tài khoản"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
