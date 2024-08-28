// app/api/forgot-password/update-password/route.ts
import { NextResponse } from 'next/server';
import { updateUserPassword } from '@/lib/db/operations'; // Ensure this function is implemented correctly

export async function POST(req: Request) {
  try {
    const { userId, newPassword } = await req.json();

    // Update user's password
    const result = await updateUserPassword(userId, newPassword);

    if (!result) {
      return NextResponse.json({ message: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    // Type guard to safely handle the error
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Error updating password', error: errorMessage }, { status: 500 });
  }
}
