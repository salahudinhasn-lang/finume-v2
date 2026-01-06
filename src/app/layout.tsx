import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finume | Financial Compliance & Experts KSA",
  description: "Finume | The Financial Operating System for Saudi SMEs. ZATCA Compliance, Bookkeeping, and Certified Experts.",
  keywords: "ZATCA, VAT KSA, E-Invoicing Saudi Arabia, Bookkeeping Riyadh, Certified Accountants, Finume, فاتورة إلكترونية, زكاة, ضريبة القيمة المضافة, محاسب قانوني",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
