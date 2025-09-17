import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode } from "react";
import "./globals.css";
import { ScrollProvider } from "@/providers/Scroll";

export const metadata: Metadata = {
  title: "LangGraph.js Gen UI",
  description: "Generative UI with Vercel AI SDK and LangGraph.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://mdbcdn.b-cdn.net/wp-content/themes/mdbootstrap4/docs-app/css/dist/mdb5/standard/core.min.css"
        />
      </head>
      <body>
        <div>
          <NuqsAdapter>
            <ScrollProvider>
              {children}
            </ScrollProvider>
          </NuqsAdapter>
        </div>
      </body>
    </html>
  );
}
