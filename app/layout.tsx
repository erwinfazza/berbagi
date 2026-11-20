import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Berbagi — ruang file belajar",
    template: "%s · Berbagi",
  },
  description:
    "Simpan materi, temukan file terbaru, dan bagikan file belajar dengan mudah.",
  applicationName: "Berbagi",
  keywords: [
    "next.js",
    "tailwind",
    "fullstack",
    "supabase",
    "file sharing",
    "typescript",
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5faf6" },
    { media: "(prefers-color-scheme: dark)", color: "#050807" },
  ],
};

/**
 * Dijalankan sebelum paint supaya tema tidak "berkedip".
 * Tema disimpan di localStorage; fallback ke preferensi sistem.
 */
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("ruang-tugas-theme");
    var isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Navbar />
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg dark:focus:bg-slate-900 dark:focus:text-white"
        >
          Lompat ke konten utama
        </a>
        {children}
        <Footer />
      </body>
    </html>
  );
}
