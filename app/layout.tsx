import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GymFlex",
  description: "Work out more. Pay less.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <div className="phone-frame">
          <div className="phone-screen">
            <div className="phone-notch" aria-hidden />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
