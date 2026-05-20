import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FitQuestProvider } from "@/components/app-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitQuest",
  description: "Fitness and lifestyle tracking with light RPG gamification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-100">
        <FitQuestProvider>{children}</FitQuestProvider>
      </body>
    </html>
  );
}
