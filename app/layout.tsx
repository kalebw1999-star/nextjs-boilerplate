import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./assessment.css";
import "./overhaul.css";
import AuthGate from "./auth-gate";
import ClipIQBridge from "./clip-iq-bridge";
import AppShell from "./app-shell";
const geistSans=Geist({variable:"--font-geist-sans",subsets:["latin"]});
const geistMono=Geist_Mono({variable:"--font-geist-mono",subsets:["latin"]});
export const metadata:Metadata={title:"Cyber Arena",description:"Competitive player assessment, recruiting and communications platform."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}><body className="min-h-full"><AuthGate><ClipIQBridge/><AppShell>{children}</AppShell></AuthGate></body></html>}
