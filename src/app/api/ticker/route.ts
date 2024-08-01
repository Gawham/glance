import { NextRequest, NextResponse } from 'next/server';
import { initializeQueries } from '@/agents/tickeragent';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { firmName } = await req.json();

    if (!firmName) {
      return NextResponse.json({ error: 'Firm name is required' }, { status: 400 });
    }

    const result = await initializeQueries({ message: firmName });
    console.log(result);  // Logs the result

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in API handler:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json('hi', { status: 200 });
}
