// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Key } from 'lucide-react';
import { loginWithCredentials } from '@/app/actions/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [step, setStep] = useState<'CREDENTIALS' | 'MFA'>('CREDENTIALS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [isSetup, setIsSetup] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginWithCredentials(email, password);
      
      if (res?.status === 'SUCCESS') {
        // Fallback: Set client-side cookies if server cookies failed
        if (res.user) {
          document.cookie = `mock_user_email=${res.user.email}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `mock_user_role=${res.user.role}; path=/; max-age=86400; SameSite=Lax`;
        }
        
        toast.success('Logged in!');
        window.location.href = '/dashboard';
        return;
      }

      if (res?.status === 'MFA_REQUIRED') {
        setStep('MFA');
        setTempToken(res.tempToken!);
        if (res.setupRequired) {
          setQrCode(res.qrCode!);
          setSecret(res.secret!);
          setIsSetup(true);
        }
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, verify the token server-side
      const res = await loginWithCredentials(email, password, mfaCode); 
      if (res?.status === 'SUCCESS') {
        if (res.user) {
          document.cookie = `mock_user_email=${res.user.email}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `mock_user_role=${res.user.role}; path=/; max-age=86400; SameSite=Lax`;
        }
        toast.success('MFA Verified!');
        window.location.href = '/dashboard';
        return;
      }
      // If it returns anything else (unlikely here), handle error
      if (res?.status === 'MFA_REQUIRED') {
         toast.error('MFA Failed or Required again?');
      }
    } catch (err) {
      toast.error('Invalid MFA Code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {step === 'MFA' ? 'Verify Identity' : 'Sign In'}
          </h2>
        </div>

        {step === 'CREDENTIALS' ? (
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfa} className="mt-8 space-y-6">
            {isSetup && (
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">Scan with Authenticator App</p>
                <img src={qrCode} alt="QR Code" className="mx-auto border p-2 rounded" />
                <p className="text-xs text-gray-400 mt-2">Secret: {secret}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Authenticator Code</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="123456"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Verify & Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
