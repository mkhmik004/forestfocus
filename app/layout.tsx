import '@coinbase/onchainkit/styles.css';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

const miniappEmbed = {
  version: "1",
  imageUrl: "https://forestfocus-umber.vercel.app/api/og",
  button: {
    title: "🌱 Start Focus",
    action: {
      type: "launch_miniapp",
      name: "ForestFocus",
      url: "https://forestfocus-umber.vercel.app",
      splashImageUrl: "https://forestfocus-umber.vercel.app/icon-512.svg",
      splashBackgroundColor: "#0f172a"
    }
  }
};

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'ForestFocus',
  description: 'A Pomodoro timer that grows virtual trees as you focus. Build your personal forest and contribute to a community forest on Base.',
  other: {
    'fc:miniapp': JSON.stringify(miniappEmbed),
    'fc:frame': JSON.stringify({
      ...miniappEmbed,
      button: {
        ...miniappEmbed.button,
        action: {
          ...miniappEmbed.button.action,
          type: "launch_frame"
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
