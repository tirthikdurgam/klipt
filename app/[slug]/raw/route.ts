import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> } // Unwrap promise
) {
  const { slug } = await params;

  try {
    const { data, error } = await supabase
      .from('clips')
      .select('content, expires_at')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return new NextResponse('Clip not found or expired', { status: 410 });
    }

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
      return new NextResponse('Clip expired', { status: 410 });
    }

    // Return ONLY the raw content string (Section 7.3)
    return new NextResponse(data.content, {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*' 
      },
    });
  } catch (err) {
    return new NextResponse('Server error', { status: 500 });
  }
}