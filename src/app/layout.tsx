
import { useRouter } from "next/navigation";
import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { DM_Sans } from "next/font/google";
import { Poppins } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";


// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

const poppins = Poppins({
  subsets: ["latin"], // Specify font subsets
  weight: ["400", "500", "600", "700"], // Include desired font weights
  variable: "--font-poppins", // Define a CSS variable for the font
});

const dmSans = DM_Sans({
  subsets: ["latin"], // Specify subsets (optional)
  weight: ["400", "500", "700"], // Specify weights (optional)
  style: ["normal", "italic"], // Specify styles (optional)
});
export const metadata: Metadata = {
  title: "Mojo Money Transfer",
  description: "Mojo Money Transfer",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${poppins.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
