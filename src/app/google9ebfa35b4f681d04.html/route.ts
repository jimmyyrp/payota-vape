import { NextResponse } from 'next/server';

/**
 * Google Search Console Verification Route
 * Handles requests for the verification HTML file required by Google.
 */
export async function GET() {
  return new NextResponse('google-site-verification: google9ebfa35b4f681d04.html', {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
