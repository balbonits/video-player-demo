import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navigation from "@/components/Navigation";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Video Player Demo Suite",
  description: "Performance-optimized video streaming players for Smart TV, OTT, and web platforms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased font-sans bg-black text-white`}
      >
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 md:ml-64 min-h-screen">
            <div className="pt-16 md:pt-0">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
