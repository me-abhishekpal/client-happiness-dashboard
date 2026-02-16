import { cookies, headers } from 'next/headers';
import prisma from './prisma';

// lib/session.ts

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const email = cookieStore.get('mock_user_email')?.value;

  if (!email) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roleRel: true }
    });
    console.log('Session User Found:', user?.email, user?.role, user?.roleRel?.name);
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
