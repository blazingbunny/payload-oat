import React from 'react'
import '../styles/globals.css'
import { Geist, Lora, Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' });

export const metadata = {
  description: 'Adrian del Rosario — Personal Brand Infrastructure',
  title: 'Adrian del Rosario',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, lora.variable)}>
      <body>{children}</body>
    </html>
  )
}
