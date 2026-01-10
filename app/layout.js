import "./globals.css";
import { ThemeProvider } from "@/components/providers";

export const metadata = {
  title: "Japanese Learning Admin",
  description: "Admin panel for Japanese Learning App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}