import type { Metadata } from "next";
import { AppSidebar, MobileNav } from "@/components/app-sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "PuengPing",
  description: "ระบบช่วยติดตามและเชื่อมต่อบริการสำหรับผู้ใช้บริการคนไร้บ้าน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full font-sans antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <div className="min-h-screen lg:flex">
          <AppSidebar />
          <div className="min-w-0 flex-1">
            <MobileNav />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
