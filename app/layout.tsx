import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ApolloWrapper } from "./ApolloWrapper";
import Nav from "./components/landing/Nav";
import Navbar from "./components/landing/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Play Plan Craft",
  description:
    "Play Plan Craft is an AI-powered teaching assistant that helps educators create personalized, developmentally appropriate lesson plans tailored to specific age groups and subjects. Built with Supabase, Drizzle ORM, TypeScript, React, Next.js, and OpenAI.",
  keywords: [
    "lesson planning",
    "AI lesson planner",
    "teaching assistant",
    "educator tools",
    "curriculum design",
    "early childhood education",
    "classroom planning",
    "teacher collaboration",
    "personalized learning",
    "OpenAI",
    "Google Calendar integration",
    "iCal sync",
    "real-time planning",
    "education technology",
    "teacher productivity",
  ],
  authors: [
    {
      name: "Alvin Quach",
      url: "https://github.com/alvinwquach",
    },
  ],
  creator: "Alvin Quach",
  metadataBase: new URL("https://www.playplancraft.com"),
  openGraph: {
    title: "Play Plan Craft – AI-Powered Lesson Planning",
    description:
      "An AI-powered teaching assistant that helps educators create personalized lesson plans with integrated scheduling, material suggestions, and real-time collaboration.",
    url: "https://www.playplancraft.com",
    siteName: "Play Plan Craft",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png" },
      new URL("/logo.png", "https://www.playplancraft.com"),
      { url: "/icon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: ["/shortcut-icon.png"],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-x3.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon-precomposed.png",
      },
    ],
  },
  manifest: "/manifest.json",
  archives: ["https://www.playplancraft.com/"],
  bookmarks: ["https://www.playplancraft.com/"],
  category: "education",
};



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bottomNav = await Nav();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ApolloWrapper>
          <Navbar />
          {children}
          {bottomNav}
        </ApolloWrapper>
      </body>
    </html>
  );
}
