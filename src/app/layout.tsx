import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/WalletProvider";
import { ToastProvider } from "@/components/ToastProvider";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oblio",
  description: "Confidential liquid staking on Solana",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={hanken.variable}>
      <body className="font-sans">
        <SolanaWalletProvider>
          <ToastProvider>{children}</ToastProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
