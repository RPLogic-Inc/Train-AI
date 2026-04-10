import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TrainingProvider } from "@/lib/training-context";
import { Sidebar } from "@/components/layout/sidebar";
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
  title: "TrainAI - AI-Powered Training Optimization",
  description:
    "AI-guided training optimization for triathlon and marathon athletes. Analyze Garmin data, track fitness metrics, and get personalized coaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="h-full bg-background text-foreground">
        <TooltipProvider>
          <TrainingProvider>
            <div className="flex h-full">
              <Sidebar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </TrainingProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
