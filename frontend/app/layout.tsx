import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Griffin — AI Agent Red Team",
  description: "Red team your AI agents before they become someone else's exploit.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
