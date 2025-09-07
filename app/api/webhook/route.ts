export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Log the webhook payload for debugging
    console.log('Farcaster webhook received:', body);
    
    // Handle different types of Farcaster interactions
    const { untrustedData } = body;
    
    if (untrustedData?.buttonIndex) {
      // Handle button interactions
      const buttonIndex = untrustedData.buttonIndex;
      
      switch (buttonIndex) {
        case 1:
          // Start Focus Session button
          return Response.json({
            type: 'frame',
            data: {
              version: '1',
              image: `${process.env.NEXT_PUBLIC_URL || 'https://forestfocus-3a553cyk2-markbetterdevs-projects.vercel.app'}/api/frame/session-started`,
              buttons: [
                { label: 'View Progress', action: 'link', target: process.env.NEXT_PUBLIC_URL || 'https://forestfocus-3a553cyk2-markbetterdevs-projects.vercel.app' },
                { label: 'Plant Tree', action: 'post' }
              ]
            }
          });
          
        case 2:
          // Plant Tree button
          return Response.json({
            type: 'frame',
            data: {
              version: '1',
              image: `${process.env.NEXT_PUBLIC_URL || 'https://forestfocus-3a553cyk2-markbetterdevs-projects.vercel.app'}/api/frame/tree-planted`,
              buttons: [
                { label: 'Start New Session', action: 'post' },
                { label: 'View Forest', action: 'link', target: process.env.NEXT_PUBLIC_URL || 'https://forestfocus-3a553cyk2-markbetterdevs-projects.vercel.app' }
              ]
            }
          });
          
        default:
          // Default response
          return Response.json({
            type: 'frame',
            data: {
              version: '1',
              image: `${process.env.NEXT_PUBLIC_URL || 'https://forestfocus-3a553cyk2-markbetterdevs-projects.vercel.app'}/hero.svg`,
              buttons: [
                { label: 'Start Focus Session', action: 'post' },
                { label: 'Open App', action: 'link', target: process.env.NEXT_PUBLIC_URL || 'https://forestfocus-3a553cyk2-markbetterdevs-projects.vercel.app' }
              ]
            }
          });
      }
    }
    
    // Default frame response
    return Response.json({
      type: 'frame',
      data: {
        version: '1',
        image: `${process.env.NEXT_PUBLIC_URL || 'https://forestfocus-3a553cyk2-markbetterdevs-projects.vercel.app'}/hero.svg`,
        buttons: [
          { label: 'Start Focus Session', action: 'post' },
          { label: 'Open App', action: 'link', target: process.env.NEXT_PUBLIC_URL || 'https://forestfocus-3a553cyk2-markbetterdevs-projects.vercel.app' }
        ]
      }
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ message: 'ForestFocus Farcaster webhook endpoint' });
}