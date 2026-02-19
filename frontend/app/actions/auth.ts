"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { getTenantId, getCurrentTenant, isSuperAdmin } from '@/lib/tenant-context';
import { prisma } from '@/lib/prisma-tenant';

export async function loginWithCredentials(email: string, password?: string, mfaToken?: string) {
  const p = prisma as any;
  // Get current tenant from context
  const tenantId = await getTenantId();
  const tenant = await getCurrentTenant();

  // 1. Check for Super Admin Login (if on admin domain or no tenant found)
  const isPlatformAdmin = await isSuperAdmin();
  if (isPlatformAdmin || !tenantId) {
    const superAdmin = await p.superAdmin.findUnique({
      where: { email }
    });

    if (superAdmin) {
      // Password Check
      const isValid = await bcrypt.compare(password || '', superAdmin.passwordHash);
      if (!isValid) return { status: 'ERROR', message: 'Invalid Super Admin password' };

      // Setting Super Admin session
      const cookieStore = await cookies();
      cookieStore.set('super_admin_session', 'true', { path: '/', maxAge: 86400 });
      cookieStore.set('mock_user_role', 'SUPERADMIN', { path: '/', maxAge: 86400 });
      cookieStore.set('mock_user_email', superAdmin.email, { path: '/', maxAge: 86400 });

      return {
        status: 'SUCCESS',
        user: {
          email: superAdmin.email,
          role: 'SUPERADMIN',
          tenantId: 'platform'
        }
      };
    }
  }

  if (!tenantId || !tenant) {
    return { status: 'ERROR', message: 'Tenant not found. Please check your URL.' };
  }

  // Find user in current tenant
  const user = await p.user.findFirst({
    where: {
      email,
      tenantId
    }
  });

  if (!user) {
    return { status: 'ERROR', message: 'User not found in this organization' };
  }

  // Domain Validation (skip for guests)
  if (!user.isGuest && (tenant as any).allowedEmailDomain) {
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (emailDomain !== (tenant as any).allowedEmailDomain.toLowerCase()) {
      return { status: 'ERROR', message: `Only @${(tenant as any).allowedEmailDomain} emails are allowed for this organization.` };
    }
  }

  // 1. Password Check
  // Allow older hardcoded password for dev/demo if hash is missing (optional)
  if (!user.passwordHash) {
    if (password !== 'password123') return { status: 'ERROR', message: 'Invalid password (Try: password123)' };
  } else {
    const isValid = await bcrypt.compare(password || '', user.passwordHash);
    if (!isValid) return { status: 'ERROR', message: 'Invalid password' };
  }

  // 2. MFA Logic
  if (user.mfaEnabled) {
    if (!mfaToken) {
      return { status: 'MFA_REQUIRED', tempToken: 'temp_valid_5m' };
    }

    // Verify Token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret!,
      encoding: 'base32',
      token: mfaToken
    });

    if (!verified) return { status: 'ERROR', message: 'Invalid MFA Code' };
  } else {
    // FORCE MFA SETUP
    if (!mfaToken) {
      const secret = speakeasy.generateSecret({ name: `ClientHappiness (${user.email})` });
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      // Temporarily store secret in DB or session (simplified: storing in DB but not enabling yet)
      await p.user.update({
        where: { id: user.id }, // Extension will add tenantId
        data: { mfaSecret: secret.base32 } // Not enabled yet
      });

      return {
        status: 'MFA_REQUIRED',
        setupRequired: true,
        qrCode,
        secret: secret.base32,
        tempToken: 'setup_mode'
      };
    } else {
      // Verify Setup Token
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret!,
        encoding: 'base32',
        token: mfaToken
      });

      if (!verified) return { status: 'ERROR', message: 'Invalid Setup Code' };

      // Enable MFA
      await p.user.update({
        where: { id: user.id }, // Extension will add tenantId
        data: { mfaEnabled: true }
      });
    }
  }

  // 3. Login Success
  try {
    const cookieStore = await cookies();
    cookieStore.set('mock_user_role', user.role, { path: '/', maxAge: 86400 });
    cookieStore.set('mock_user_email', user.email, { path: '/', maxAge: 86400 });
    cookieStore.set('mock_user_tenant_id', user.tenantId, { path: '/', maxAge: 86400 });
  } catch (e) {
    console.error('Failed to set cookies server-side:', e);
  }

  return {
    status: 'SUCCESS',
    user: {
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      isGuest: user.isGuest
    }
  };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('mock_user_role');
  cookieStore.delete('mock_user_email');
  cookieStore.delete('mock_user_tenant_id');
  cookieStore.delete('super_admin_session');
  redirect('/login');
}
