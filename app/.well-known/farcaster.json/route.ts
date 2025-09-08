function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const manifest = {
    frame: {
      name: "ForestFocus",
      version: "1",
      iconUrl: `https://forestfocus-umber.vercel.app/icon.png`,
      homeUrl: `https://forestfocus-umber.vercel.app`,
      imageUrl: `https://forestfocus-umber.vercel.app/image.png`,
      splashImageUrl: `https://forestfocus-umber.vercel.app/splash.png`,
      splashBackgroundColor: "#10b981",
      webhookUrl: `https://forestfocus-umber.vercel.app/api/webhook`,
      subtitle: "ForestFocus",
      description: "ForestFocus is a productivity mini app on Base that turns your focus sessions into a growing digital forest. Each time you complete a study or work session, you earn LeafCoin and your trees mature, from seedlings to full-grown trees. You can grow your own forest, contribute to a shared community grove, and share your progress directly on Farcaster.",
      primaryCategory: "productivity",
      screenshotUrls: [`https://forestfocus-umber.vercel.app/screenshot1.png`],
      heroImageUrl: `https://forestfocus-umber.vercel.app/hero.png`,
      tags: ["productivity", "focus", "blockchain", "base"],
      tagline: "Grow your productivity forest",
      buttonTitle: "Open mini app",
      ogTitle: "ForestFocus – Productivity Forest",
      ogDescription: "Turn your focus sessions into a thriving digital forest on Base blockchain",
      ogImageUrl: `https://forestfocus-umber.vercel.app/og-image.png`,
      castShareUrl: "https://warpcast.com/~/compose?text=Check+out+ForestFocus+%F0%9F%8C%B1+Turn+your+focus+into+a+digital+forest%21"
    },
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    }
  };

  return Response.json(manifest);
}