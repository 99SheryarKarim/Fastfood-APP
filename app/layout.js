import "./globals.css";
import { Bowlby_One, DM_Sans } from "next/font/google";

const display = Bowlby_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  title: "Pizza King | The King of Crust & Flavor",
  description:
    "Premium pizza, burgers and deals. Order online or by Urdu AI voice, 24/7.",
  metadataBase: new URL("https://pizza-king.vercel.app"),
  openGraph: {
    title: "Pizza King | The King of Crust & Flavor",
    description:
      "Premium pizza, burgers and deals. Order online or by Urdu AI voice, 24/7.",
    url: "https://pizza-king.vercel.app",
    siteName: "Pizza King",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-ink text-[#f5f0e8] antialiased selection:bg-king selection:text-white">
        {children}
      </body>
    </html>
  );
}
