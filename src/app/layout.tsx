import type { Metadata, Viewport } from "next";
import { ZCOOL_XiaoWei } from "next/font/google";
import "./globals.css";

const zcool = ZCOOL_XiaoWei({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-zcool",
});

export const metadata: Metadata = {
  title: "我们的故事",
  description: "属于我们的私有回忆空间",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "我们的故事" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${zcool.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
