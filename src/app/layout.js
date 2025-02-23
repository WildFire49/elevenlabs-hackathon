import { Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
});

export const metadata = {
  title: "Voice Canvas AI",
  description: "Voice Canvas AI - Create professional videos with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${onest.variable} antialiased font-onest`}>
        {children}
      </body>
    </html>
  );
}
