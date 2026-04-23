import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Fetch Clip Data
 * Resolves Next.js 15+ Async params and maps DB fields to UI-friendly keys.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // 1. Unwrap the params promise
  const { slug } = await params;

  try {
    // 2. Fetch from Supabase
    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;

    // 3. Handle Not Found
    if (!data) {
      return NextResponse.json({ error: 'Clip not found' }, { 
        status: 410, 
        headers: { 'Access-Control-Allow-Origin': '*' } 
      });
    }

    // 4. Handle Expiry (Lazy Delete Strategy)
    const isExpired = new Date(data.expires_at) < new Date();
    if (isExpired) {
      await supabase.from('clips').delete().eq('id', data.id);
      return NextResponse.json({ error: 'Clip expired' }, { 
        status: 410, 
        headers: { 'Access-Control-Allow-Origin': '*' } 
      });
    }

    // 5. Increment View Count (Fire and forget)
    // We update the DB but return the incremented value to the UI immediately
    supabase
      .from('clips')
      .update({ view_count: data.view_count + 1 })
      .eq('id', data.id)
      .then();

    // 6. Return mapped JSON (Snake to Camel)
    // This fixes the "Invalid Date" and "Views: " issues in the UI
    return NextResponse.json(
      {
        slug: data.slug,
        content: data.content,
        language: data.language,
        createdAt: data.created_at, // Maps to clip.createdAt
        expiresAt: data.expires_at, // Maps to clip.expiresAt
        viewCount: data.view_count + 1, // Maps to clip.viewCount
      },
      {
        status: 200,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' 
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Delete Clip
 * Requires a valid deleteToken to match the DB row to prevent unauthorized deletion.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Parse the token from the frontend request
    const body = await request.json();
    const { deleteToken } = body;

    if (!deleteToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing delete token.' }, 
        { status: 401 }
      );
    }

    // Attempt deletion ONLY if both the slug and the token match.
    // Adding .select() forces Supabase to return the deleted row(s) if successful.
    const { data, error } = await supabase
      .from('clips')
      .delete()
      .eq('slug', slug)
      .eq('delete_token', deleteToken)
      .select();

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: 'Database error while deleting.' }, { status: 500 });
    }

    // If data is empty, it means the row wasn't found OR the token was incorrect.
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid delete token or clip does not exist.' }, 
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: 'Clip deleted successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Unexpected delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete clip' },
      { status: 500 }
    );
  }
}