'use client';
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";
import { WebChatContainer, setEnableDebug } from '@ibm-watson/assistant-web-chat-react';
import { siteConfig } from "@/config";
import { ModalProvider } from "@/providers/modal-provider";
import { ToasterProvider } from "@/providers/toaster-provider";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = siteConfig;
const webChatOptions = {
  integrationID: '8b32e0fe-ee72-4e86-b765-8bc861cf12cf',
  region: 'eu-gb',
  serviceInstanceID: 'bf336989-02a9-462c-99af-357569671baf',
};

setEnableDebug(true);
export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6F5AF6",
        },
        layout: {
          logoPlacement: "none",
        },
      }}
    >
      
      <html lang="en">
        {/* <CrispProvider /> */}
        <WebChatContainer config={webChatOptions}/>
        <body className={inter.className}>
          
          <ModalProvider />
          <ToasterProvider />
          {children}
        </body>
        
      </html>
    </ClerkProvider>
  );
}
