// lib/session.ts
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

// Use global prisma instance if available to prevent connection leaks in dev
const prisma = new PrismaClient();

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const email = cookieStore.get('mock_user_email')?.value;

  console.log('Session Email from Cookie:', email);

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
