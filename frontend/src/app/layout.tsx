// frontend/src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import NavBar from "../components/NavBar";

export const metadata: Metadata = {
  title: "Blood Bank + RAG AI",
  description: "AI-ready blood bank management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="
          min-h-screen
          bg-[var(--bg)]
          text-[var(--text-primary)]
          antialiased
          overflow-x-hidden
        "
      >
        <NavBar />

        <main
          className="
            mx-auto max-w-7xl
            px-4 sm:px-6
            pt-20 pb-6 sm:pb-10
          "
        >
          {children}
        </main>
      </body>
    </html>
  );
}
