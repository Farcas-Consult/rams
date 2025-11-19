import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import NextTopLoader from "nextjs-toploader";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Auth System",
  description: "Auth System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Replace this with your own analytics script */}
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="352eab6a-a921-4d6b-b73c-3282f2a38d2f"
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader color="linear-gradient(90deg, rgb(20, 71, 230), rgb(133, 176, 255))" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
