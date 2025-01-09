import "./globals.css";
import { Providers } from "./provider";
import { Metadata } from "next"; // Import Metadata

export const metadata: Metadata = {
  title: "Group Beats",
  description: "Group Beats - Collaborate with music!",
  icons: {
    icon: "/group_beats_icon.svg", // Your favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
