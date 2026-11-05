import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { ExperienceProvider } from "@/components/providers/Experience";
import { SpaceProvider } from "@/components/providers/SpaceProvider";
import { Cursor } from "@/components/ui/Cursor";
import { site } from "@/content/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: `${site.name} | ${site.programme} Digital Print`,
  description: `${site.name} is an ${site.programme} think tank. ${site.mission}`,
};

export const viewport: Viewport = {
  themeColor: "#f2eee5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <SmoothScroll>
          <ExperienceProvider>
            <SpaceProvider>
              {children}
              <Cursor />
              <div className="grain" aria-hidden />
            </SpaceProvider>
          </ExperienceProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
