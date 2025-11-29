import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const backendApiKey = process.env.BACKEND_API_KEY;

  return NextResponse.json({
    backendUrl: backendUrl || 'NOT SET',
    backendApiKey: backendApiKey ? `${backendApiKey.substring(0, 10)}...` : 'NOT SET',
    hasBackendUrl: !!backendUrl,
    hasBackendApiKey: !!backendApiKey,
    isConfigured: !!(backendUrl && backendApiKey),
    nodeEnv: process.env.NODE_ENV,
  });
}

