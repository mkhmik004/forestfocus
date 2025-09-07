export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Handle different webhook events from Farcaster
    switch (body.type) {
      case 'session_started':
        return Response.json({
          type: 'frame',
          image: `${process.env.NEXT_PUBLIC_URL || 'https://forestfocus.base.dev'}/api/frame/session-started`,
          buttons: [
            { label: 'View Progress', action: 'link', target: process.env.NEXT_PUBLIC_URL || 'https://forestfocus.base.dev' },
          ]
        });
        
      case 'tree_planted':
        return Response.json({
          type: 'frame',
          image: `${process.env.NEXT_PUBLIC_URL || 'https://forestfocus.base.dev'}/api/frame/tree-planted`,
          buttons: [
            { label: 'Continue Focus', action: 'post' },
            { label: 'View Forest', action: 'link', target: process.env.NEXT_PUBLIC_URL || 'https://forestfocus.base.dev' }
          ]
        });
        
      case 'focus_completed':
        return Response.json({
          type: 'frame',
          image: `${process.env.NEXT_PUBLIC_URL || 'https://forestfocus.base.dev'}/hero.svg`,
          buttons: [
            { label: 'Start Focus Session', action: 'post' },
            { label: 'Open App', action: 'link', target: process.env.NEXT_PUBLIC_URL || 'https://forestfocus.base.dev' }
          ]
        });
        
      default:
        return Response.json({
          type: 'frame',
          image: `${process.env.NEXT_PUBLIC_URL || 'https://forestfocus.base.dev'}/hero.svg`,
          buttons: [
            { label: 'Try Again', action: 'post' },
            { label: 'Open App', action: 'link', target: process.env.NEXT_PUBLIC_URL || 'https://forestfocus.base.dev' }
          ]
        });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}