// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize the Upstash Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create a sliding window ratelimiter: 10 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true, // Gives you pretty charts in the Upstash dashboard
});

export async function middleware(request: NextRequest) {
  // We only want to rate-limit POST requests (creating new clips).
  // We let GET requests (viewing clips) pass through freely.
  if (request.method !== 'POST') {
    return NextResponse.next();
  }

  // Extract the user's IP address. 
  // Vercel provides 'x-forwarded-for' in production. In local dev, it falls back to '127.0.0.1'.
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // Run the check
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  // If the user has exceeded 10 requests in the last minute, block them.
  if (!success) {
    return NextResponse.json(
      { error: 'Whoa there! You are creating clips too fast. Please wait a minute.' },
      { 
        status: 429, 
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      }
    );
  }

  // If they are under the limit, let the request proceed to your API route
  return NextResponse.next();
}

// Tell Next.js exactly which routes this middleware should protect.
// We only want it running on the clips API route to save compute time.
export const config = {
  matcher: '/api/clips',
};