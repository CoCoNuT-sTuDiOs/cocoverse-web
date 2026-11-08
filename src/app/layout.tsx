import type { Metadata } from "next";
import { Bagel_Fat_One, Fraunces, Syne, Syne_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "../components/Header";
import { FloatingDock } from "../components/FloatingDock";
import { SiteFooter } from "../components/SiteFooter";

const bagel = Bagel_Fat_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bagel",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const syneMono = Syne_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-syne-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "CocoVerse UI", template: "%s · CocoVerse UI" },
  description:
    "Animated 3D and particle effects for Flutter. Every effect has a live preview, its parameters and code to copy.",
};

// Sets the theme before the page paints, so there is no flash of the wrong one.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){}document.documentElement.classList.add('js');})();`;


export default function RootLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bagel.variable} ${fraunces.variable} ${syne.variable} ${syneMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
      <Header />
        <FloatingDock />
        {children}
        <SiteFooter/>
        {modal}
      </body>
    </html>
  );
}