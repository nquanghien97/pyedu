'use client';

import Link from "next/link";
import { Button } from "../button";
import { ArrowRight, Menu, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="PyEdu Logo"
              width={44}
              height={44}
              className="group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: "Tính năng", id: "features" },
              { label: "Cách hoạt động", id: "how-it-works" },
              { label: "Đối tượng", id: "for-who" },
              { label: "AI", id: "ai-powered" },
            ].map((item) => (
              <a
                key={item.id}
                href={`/#${item.id}`}
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200 cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Login Button */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button className="bg-primary hover:bg-blue-600 text-white px-6 cursor-pointer rounded-lg shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
                Đăng nhập
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-primary transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {[
              { label: "Tính năng", id: "features" },
              { label: "Cách hoạt động", id: "how-it-works" },
              { label: "Đối tượng", id: "for-who" },
              { label: "AI", id: "ai-powered" },
            ].map((item) => (
              <a
                key={item.id}
                href={`/#${item.id}`}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            ))}
            <Link href="/login" className="block">
              <Button className="w-full bg-primary hover:bg-blue-600 text-white cursor-pointer">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}