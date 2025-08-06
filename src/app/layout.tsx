import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ErrorProvider } from "./context/ErrorContext";
import { Toaster } from "react-hot-toast";

const noto_sans = Noto_Sans({ 
  subsets: ['latin'],
  weight: ['300', '700'], 
  variable: '--font-noto-sans', 
})

export const metadata: Metadata = {
  title: "Loop Life",
  description: "Tu red social de musica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${noto_sans.variable}`} translate="no">
      <body>
        <AuthProvider>
          <ErrorProvider>
            {children}
            <Toaster position="top-center" reverseOrder={false}/>
          </ErrorProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
