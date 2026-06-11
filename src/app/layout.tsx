import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Exit Exam Ethiopia | ዩኒቨርሲቲ ምረቃ ፈተና",
  description:
    "Prepare for your university graduation exit exam with thousands of practice questions, department-specific exams, and AI-powered learning tools.",
  keywords: [
    "exit exam ethiopia",
    "university graduation exam",
    "ethiopian higher education",
    "exit exam preparation",
    "AAU exit exam",
  ],
  authors: [{ name: "Exit Exam Ethiopia" }],
  metadataBase: new URL("https://exitexam.et"),
  openGraph: {
    title: "Exit Exam Ethiopia",
    description: "Ethiopia's #1 University Exit Exam Preparation Platform",
    type: "website",
    locale: "en_ET",
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
