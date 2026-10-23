import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NoticeBar } from "@/components/notice-bar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "SMA e-Permit Portal",
  description: "Sharjah Maritime Academy contractor permits",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.remove("dark","midnight");try{localStorage.setItem("sma-theme","light")}catch(e){}`,
          }}
        />
        <NoticeBar />
        {children}
      </body>
    </html>
  );
}
