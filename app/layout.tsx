import type { Metadata } from "next";
import { Source_Code_Pro } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ilia's Site",
  description: "Thoughts on technology, AI, and living a simple life.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={sourceCodePro.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}
