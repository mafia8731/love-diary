import type { Metadata } from "next";
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
