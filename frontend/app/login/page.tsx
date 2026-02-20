// app/login/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Key, EyeOff, Eye } from 'lucide-react';
import { loginWithCredentials } from '@/app/actions/auth';
import toast from 'react-hot-toast';

function LoginContent() {
  const [step, setStep] = useState<'CREDENTIALS' | 'MFA'>('CREDENTIALS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('error') === 'access_denied') {
      toast.error('Access Denied');
      router.replace('/login');
    }
  }, [searchParams, router]);

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

      if (res?.status === 'ERROR') {
        toast.error(res.message);
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
      toast.error('An unexpected error occurred during login');
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

      if (res?.status === 'ERROR') {
        toast.error(res.message);
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
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left Column - Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 relative z-10 bg-white">
        <div className="max-w-[440px] w-full mx-auto">
          {/* Logo */}
          <div className="mb-10">
            <div className="w-12 h-12 flex items-center justify-center text-[#5b21b6]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                <path d="M12 2L15 8H9L12 2Z" />
                <path d="M4 10L9 10L7 20H17L15 10H20L12 22L4 10Z" />
              </svg>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
              {step === 'MFA' ? 'Verify Identity !' : 'Welcome back !'}
            </h2>
            <p className="text-gray-500 text-sm">
              {step === 'MFA' ? 'Enter the code from your authenticator app.' : 'Enter to get unlimited access to data & information.'}
            </p>
          </div>

          {step === 'CREDENTIALS' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-900">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  placeholder="Enter your mail address"
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/20 focus:border-[#5b21b6] sm:text-sm transition-all text-gray-900 placeholder-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-900">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    placeholder="Enter password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-4 pr-12 py-3.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/20 focus:border-[#5b21b6] sm:text-sm transition-all text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#5b21b6] focus:ring-[#5b21b6] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-bold text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-bold text-[#5b21b6] hover:text-[#4c1d95] transition-colors">
                    Forgot your password ?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-[15px] font-bold text-white bg-[#5b21b6] hover:bg-[#4c1d95] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5b21b6] transition-all mt-4"
              >
                Log In
              </button>
            </form>
          ) : (
            <form onSubmit={handleMfa} className="space-y-6">
              {isSetup && (
                <div className="text-center mb-6">
                  <p className="text-sm font-bold text-gray-900 mb-2">Scan with Authenticator App</p>
                  <img src={qrCode} alt="QR Code" className="mx-auto border-2 border-dashed border-gray-200 p-3 rounded-xl" />
                  <p className="text-xs font-mono bg-gray-50 text-gray-600 p-2 rounded max-w-[200px] mx-auto mt-3 overflow-hidden text-ellipsis">
                    {secret}
                  </p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-900">
                  Authenticator Code <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/20 focus:border-[#5b21b6] sm:text-sm transition-all text-gray-900 tracking-widest font-mono"
                    placeholder="123 456"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-[15px] font-bold text-white bg-[#5b21b6] hover:bg-[#4c1d95] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5b21b6] transition-all mt-4"
              >
                Verify & Login
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Column - Decorative Background */}
      <div className="hidden lg:flex relative overflow-hidden bg-[#1a144e] items-center justify-center">
        {/* Abstract shapes matching the vibe of the mock */}

        {/* Top left purple leaf */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#8b5cf6] rounded-br-[100px] opacity-90" />

        {/* Top right cubes pattern placeholder */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4c1d95] opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #5b21b6 25%, transparent 25%, transparent 75%, #5b21b6 75%, #5b21b6), repeating-linear-gradient(45deg, #5b21b6 25%, transparent 25%, transparent 75%, #5b21b6 75%, #5b21b6)', backgroundPosition: '0 0, 20px 20px', backgroundSize: '40px 40px' }} />

        {/* Big semi-circle right */}
        <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#4f46e5] opacity-90" />

        {/* Big dark blue rounded pill intersecting */}
        <div className="absolute bottom-[20%] right-0 w-[70%] h-48 bg-[#0f172a] rounded-l-full z-10" />

        {/* Teal square bottom right */}
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#06b6d4]" />

        {/* Purple quarter circle bottom left */}
        <div className="absolute bottom-[-5%] left-[-5%] w-72 h-72 bg-[#7c3aed] rounded-tr-full" />

        {/* Teal rectangle middle left */}
        <div className="absolute top-[50%] left-24 w-24 h-32 bg-[#0ea5e9] rotate-12 z-10" />

        {/* Yellow Starburst */}
        <div className="absolute top-[45%] left-[30%] text-[#facc15] z-20">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
          </svg>
        </div>

        {/* Floating triangles */}
        <div className="absolute top-[30%] left-16 space-y-3 z-10">
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[30px] border-transparent border-b-[#818cf8]" />
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[30px] border-transparent border-b-[#818cf8]" />
        </div>

        {/* Floating dots matrix */}
        <div className="absolute bottom-16 right-16 text-[#2dd4bf] grid grid-cols-4 gap-3 z-20">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-current opacity-80" />
          ))}
        </div>

        {/* Geometric cross */}
        <div className="absolute top-[35%] right-[25%] opacity-50 space-y-2">
          <div className="flex space-x-2">
            <div className="w-3 h-8 bg-[#818cf8] rounded-full" />
            <div className="w-3 h-8 bg-[#818cf8] rounded-full" />
          </div>
          <div className="flex space-x-2">
            <div className="w-3 h-8 bg-[#818cf8] rounded-full" />
            <div className="w-3 h-8 bg-[#818cf8] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
