import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexucon",
  description: "Construction Workflow and Project Coordination Platform",
  icons: {
    icon: [
      { url: "https://res.cloudinary.com/depeqzb6z/image/upload/v1763210697/white_logo_mn0ohx.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "https://res.cloudinary.com/depeqzb6z/image/upload/v1763210697/white_logo_mn0ohx.svg",
    apple: "https://res.cloudinary.com/depeqzb6z/image/upload/v1763210697/white_logo_mn0ohx.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
