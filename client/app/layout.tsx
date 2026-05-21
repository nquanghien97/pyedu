import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { ToastContainer } from 'react-toastify';
import AuthProvider from "@/components/auth-provider";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PyEdu",
  description: "Nền tảng học và gia sư trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${ibmPlexSans.variable} font-sans antialiased`}
      >
        <ToastContainer />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
