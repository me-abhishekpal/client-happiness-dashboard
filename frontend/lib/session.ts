import { cookies } from 'next/headers';
import { prisma } from './prisma-tenant';
import { getTenantId } from './tenant-context';

// lib/session.ts

export async function getCurrentUser() {
  const p = prisma as any;
  const cookieStore = await cookies();
  const email = cookieStore.get('mock_user_email')?.value;
  const isSuperAdminSession = cookieStore.get('super_admin_session')?.value === 'true';

  if (!email) return null;

  try {
    if (isSuperAdminSession) {
      const superAdmin = await p.superAdmin.findUnique({
        where: { email }
      });
      if (superAdmin) {
        return {
          ...superAdmin,
          role: 'SUPERADMIN' as const,
        };
      }
    }

    const tenantId = await getTenantId();
    if (!tenantId) return null;

    const user = await p.user.findFirst({
      where: {
        email,
        tenantId
      },
      include: { roleRel: true }
    });

    // console.log('Session User Found:', user?.email, user?.role, user?.roleRel?.name);
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
