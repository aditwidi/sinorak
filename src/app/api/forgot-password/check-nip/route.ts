// app/api/forgot-password/check-nip/route.ts
import { NextResponse } from 'next/server';
import { getUserBynip } from '@/lib/db/operations';

export async function POST(req: Request) {
  try {
    const { nip } = await req.json();

    // Fetch user by NIP
    const user = await getUserBynip(nip);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return success response if the user is found
    return NextResponse.json({ message: 'User found', userId: user.id }, { status: 200 });
  } catch (error) {
    // Type guard to check if the error is an instance of Error
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return NextResponse.json({ message: 'Error fetching user', error: errorMessage }, { status: 500 });
  }
}
