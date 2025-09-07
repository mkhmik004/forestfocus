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
  const URL = process.env.NEXT_PUBLIC_URL || "https://forestfocus-4fno6yles-markbetterdevs-projects.vercel.app";

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: withValidProperties({
      version: "1",
      name: "ForestFocus",
      subtitle: "Productivity & Environmental Impact",
      description: "A gamified Pomodoro timer that plants virtual trees while you focus, combining productivity with environmental awareness on Base blockchain.",
      screenshotUrls: [],
      iconUrl: `${URL}/icon.svg`,
      splashImageUrl: `${URL}/splash.svg`,
      splashBackgroundColor: "#10b981",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: "productivity",
      tags: ["productivity", "environment", "gamification", "pomodoro"],
      heroImageUrl: `${URL}/hero.svg`,
      tagline: "Focus. Grow. Impact.",
      ogTitle: "ForestFocus - Productive Focus with Environmental Impact",
      ogDescription: "Plant virtual trees while staying focused with our gamified Pomodoro timer. Turn your productivity into environmental awareness.",
      ogImageUrl: `${URL}/hero.svg`,
    }),
    baseBuilder: {
      allowedAddresses: ["0xcF5902a5D2a671849f0a44C87BF58AafF51FFE9F"]
    }
  });
}