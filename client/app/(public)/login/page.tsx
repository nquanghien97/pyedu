'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/services/auth";
import { useAuthStore } from "@/stores/auth.store";
import { UserEntity } from "@/entity/user";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image"
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { USER_ROLE } from "@/entity/user";
import { withGuest } from "@/hoc/withGuest";

const schema = z.object({
  email: z.string().min(1, "email is required"),
  password: z.string().min(1, "Password is required"),
})

interface FormValues {
  email: string;
  password: string;
}

function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(schema),
  });

  const { setUser } = useAuthStore();

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      const res: any = await login(data)
      const userData = res.user as UserEntity | null;
      if (userData) {
        // Lưu data user vào store
        setUser(userData);
        // Lưu role vào js-cookie để Client/HOC/Middleware cùng đọc được
        Cookies.set('role', userData.role);

        // Redirect theo role
        if (userData.role === USER_ROLE.TEACHER) {
          router.push('/teacher');
        } else if (userData.role === USER_ROLE.STUDENT) {
          router.push('/student');
        } else if (userData.role === USER_ROLE.ADMIN) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      console.log(err)
      alert("Đăng nhập thất bại, vui lòng thử lại!");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[url('/blue_sky.jpg')] bg-cover h-screen w-screen flex items-center justify-center">
      <div className="w-1/2 m-auto bg-white rounded-lg shadow-lg px-8 py-4">
        <div className="">
          <div className="flex justify-center">
            <Link href="/">
              <Image src="/logo.png" alt="Logo" width={100} height={100} />
            </Link>
          </div>
          <h1 className="mb-4 text-3xl font-semibold text-center">Đăng nhập tài khoản</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Email" className="mb-4" />}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Password" type="password" className="mb-4" />}
            />
            <div className="flex justify-center mb-2">
              <Button variant="outline" className="bg-[#3b82f6] px-8 cursor-pointer text-white hover:text-white hover:bg-[#2563eb]">Login</Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Bạn chưa có tài khoản?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Đăng ký
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default withGuest(LoginPage);