'use client'

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
  X,
} from "lucide-react";
import { getUsers, deleteUserAdmin } from "@/services/admin";
import { CreateUserDialog } from "@/components/shared/admin/create-user-dialog";
import { EditUserDialog } from "@/components/shared/admin/edit-user-dialog";
import { notification } from "@/components/notification";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { H1, P } from "@/components/ui/typography";

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị viên",
  TEACHER: "Giáo viên",
  STUDENT: "Học sinh",
};

const ROLE_BADGE_STYLES: Record<string, string> = {
  ADMIN: "bg-red-50 text-red-600 border-red-100",
  TEACHER: "bg-blue-50 text-blue-600 border-blue-100",
  STUDENT: "bg-green-50 text-green-600 border-green-100",
};

const ROLE_AVATAR_STYLES: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-600",
  TEACHER: "bg-blue-100 text-blue-600",
  STUDENT: "bg-green-100 text-green-600",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({
        page: pagination.page,
        limit: pagination.limit,
        role: roleFilter || undefined,
        search: search || undefined,
      });
      if (res.success) {
        setUsers(res.data as unknown as UserItem[]);
        if (res.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.pagination!.total,
            totalPages: res.pagination!.totalPages,
          }));
        }
      }
    } catch (error) {
      notification.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeletingId(userToDelete.id);
    try {
      const res = await deleteUserAdmin(userToDelete.id);
      if (res.success) {
        notification.success("Đã xoá người dùng thành công");
        fetchUsers();
      }
    } catch (error) {
      notification.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setDeletingId(null);
      setUserToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <H1>Quản lý người dùng</H1>
          <P className="text-sm text-gray-400 mt-0.5">
            Tạo, chỉnh sửa và quản lý tài khoản người dùng trên hệ thống.
          </P>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="cursor-pointer flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <Plus size={16} />
          Tạo tài khoản mới
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            {searchInput && (
              <Button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </Button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            {["", "ADMIN", "TEACHER", "STUDENT"].map((role) => (
              <Button
                key={role}
                onClick={() => handleRoleFilter(role)}
                className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${roleFilter === role
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {role === "" ? "Tất cả" : ROLE_LABELS[role]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users size={48} className="mb-3 text-gray-300" />
            <P className="text-sm font-medium">Không tìm thấy người dùng nào</P>
            <P className="text-xs mt-1">Thử thay đổi bộ lọc hoặc tạo tài khoản mới</P>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {["NGƯỜI DÙNG", "EMAIL", "VAI TRÒ", "NGÀY TẠO", "HÀNH ĐỘNG"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-400 tracking-wide px-5 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${ROLE_AVATAR_STYLES[u.role] || "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${ROLE_BADGE_STYLES[u.role] || "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                      >
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setEditingUser(u)}
                          className="cursor-pointer w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-all duration-200"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          onClick={() => setUserToDelete(u)}
                          disabled={deletingId === u.id}
                          className="cursor-pointer w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-200 disabled:opacity-50"
                          title="Xoá"
                        >
                          {deletingId === u.id ? (
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-red-500" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
              <P className="text-xs text-gray-400">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} người dùng
              </P>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="cursor-pointer w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1;
                  })
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="w-8 text-center text-xs text-gray-400">…</span>
                      )}
                      <Button
                        onClick={() => handlePageChange(p)}
                        className={`cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${p === pagination.page
                          ? "bg-blue-500 text-white"
                          : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        {p}
                      </Button>
                    </span>
                  ))}
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="cursor-pointer w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dialogs */}
      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          fetchUsers();
        }}
      />

      {editingUser && (
        <EditUserDialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          user={editingUser}
          onSuccess={() => {
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}

      {userToDelete && (
        <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">Xác nhận xoá</DialogTitle>
              <DialogDescription className="text-sm text-gray-400">
                Bạn có chắc chắn muốn xoá người dùng này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUserToDelete(null)} disabled={deletingId !== null}>
                Huỷ
              </Button>
              <Button onClick={confirmDelete} disabled={deletingId !== null} className="bg-red-500 hover:bg-red-600 border-transparent">
                {deletingId !== null ? "Đang xoá..." : "Xoá"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
