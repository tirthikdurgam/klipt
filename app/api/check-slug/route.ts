import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  // 1. Basic validation (Section 6.1)
  if (!slug) {
    return NextResponse.json({ available: false, reason: 'Slug is required' }, { status: 400 });
  }

  // Regex: 3-60 characters, lowercase letters, numbers, and hyphens only (Section 5.1, 6.1)
  const slugRegex = /^[a-z0-9-]{3,60}$/;
  if (!slugRegex.test(slug)) {
    return NextResponse.json({ 
      available: false, 
      reason: 'Slugs must be 3-60 characters and use only lowercase letters, numbers, or hyphens.' 
    });
  }

  try {
    // 2. Check Database for uniqueness (Section 5.3)
    const { data, error } = await supabase
      .from('clips')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;

    // If data is null, the slug is available
    return NextResponse.json({ available: !data });

  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}