import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the manifest template from public directory
    const manifestPath = path.join(process.cwd(), 'public', '.well-known', 'farcaster.json');
    const manifestTemplate = fs.readFileSync(manifestPath, 'utf8');
    
    // Replace environment variable placeholders
    const manifest = manifestTemplate
      .replace('${FARCASTER_HEADER}', process.env.FARCASTER_HEADER || '')
      .replace('${FARCASTER_PAYLOAD}', process.env.FARCASTER_PAYLOAD || '')
      .replace('${FARCASTER_SIGNATURE}', process.env.FARCASTER_SIGNATURE || '');
    
    // Parse and return as JSON
    const manifestJson = JSON.parse(manifest);
    
    return NextResponse.json(manifestJson, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving manifest:', error);
    return NextResponse.json(
      { error: 'Failed to load manifest' },
      { status: 500 }
    );
  }
}