import { cookies } from 'next/headers';
import { prismaBase as prisma } from './prisma-base';
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

    if (!user) return null;

    // Sanitize user object to prevent serialization errors
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      title: user.title,
      departmentId: user.departmentId,
      image: null, // Ensure compatibility
      roleRel: user.roleRel ? {
        name: user.roleRel.name,
        permissions: user.roleRel.permissions
      } : null
    };
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
