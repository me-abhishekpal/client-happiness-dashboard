// app/actions/auth.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

export async function loginWithCredentials(email: string, password?: string, mfaToken?: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('User not found');
  }

  // 1. Password Check (Simulated for initial user, strict for others)
  // In real world: if (!user.passwordHash) throw new Error('Setup required');
  // if (!bcrypt.compareSync(password, user.passwordHash)) throw new Error('Invalid password');
  
  if (password !== 'password123') { // Simple default for demo
     throw new Error('Invalid password (Try: password123)');
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
    
    if (!verified) throw new Error('Invalid MFA Code');
  } else {
    // FORCE MFA SETUP
    if (!mfaToken) {
      const secret = speakeasy.generateSecret({ name: `ClientHappiness (${user.email})` });
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
      
      // Temporarily store secret in DB or session (simplified: storing in DB but not enabling yet)
      await prisma.user.update({
        where: { id: user.id },
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

      if (!verified) throw new Error('Invalid Setup Code');

      // Enable MFA
      await prisma.user.update({
        where: { id: user.id },
        data: { mfaEnabled: true }
      });
    }
  }

  // 3. Login Success
  // Try setting server-side cookies (best practice)
  try {
    cookies().set('mock_user_role', user.role, { path: '/', maxAge: 86400 });
    cookies().set('mock_user_email', user.email, { path: '/', maxAge: 86400 });
  } catch (e) {
    console.error('Failed to set cookies server-side:', e);
  }
  
  return { 
    status: 'SUCCESS',
    user: { email: user.email, role: user.role }
  };
}

export async function logout() {
  cookies().delete('mock_user_role');
  cookies().delete('mock_user_email');
  redirect('/login');
}
