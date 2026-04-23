import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const { content, slug, language, expirySeconds } = await request.json();

    // 1. Server-side Validation (Section 6.1)
    // content: required, max 500,000 characters
    if (!content || content.length > 500000) {
      return NextResponse.json({ error: 'Content too long or empty' }, { status: 400 });
    }

    // 2. Slug Handling (Section 5.4)
    // If no slug is provided, generate a random 6-character alphanumeric slug
    const finalSlug = slug || nanoid(6).toLowerCase();

    // 3. Explicit Expiry Calculation (Section 5.5)
    // Convert seconds from the request into a valid ISO timestamp
    const secondsToLive = expirySeconds || 86400; // Default to 1 day if not provided
    const expiresAt = new Date(Date.now() + secondsToLive * 1000).toISOString();

    // 4. Insert into Database (Section 4.1)
    const { data, error } = await supabase
      .from('clips')
      .insert([
        { 
          slug: finalSlug, 
          content, 
          language, 
          expires_at: expiresAt // Explicitly set to prevent NULL issues
        }
      ])
      // THE MAGIC: Explicitly select the auto-generated delete_token
      .select('slug, expires_at, delete_token')
      .single();

    if (error) {
      // Handle slug collision (Section 6.1)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'That URL is already taken.' }, { status: 409 });
      }
      throw error;
    }

    // Return 201 Created with the slug, full URL, and the secret deleteToken
    return NextResponse.json(
      { 
        slug: data.slug, 
        url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/${data.slug}`,
        expiresAt: data.expires_at,
        deleteToken: data.delete_token // Passing the ticket back to the browser!
      }, 
      { status: 201 }
    );

  } catch (err) {
    console.error('Creation error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}