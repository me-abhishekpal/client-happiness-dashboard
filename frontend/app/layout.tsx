import './globals.css';

export const metadata = {
  title: 'Client Happiness Dashboard',
  description: 'Enterprise RAG Tracking',
}

import { Toaster } from 'react-hot-toast';
import { AppShell } from '@/components/AppShell';

import { getCurrentUser } from '@/lib/session';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser();
  const role = user?.role;

  return (
    <html lang="en">
      <body className="bg-brand-bg text-gray-900 antialiased overflow-x-hidden">
        <Toaster position="top-right" />
        <AppShell role={role}>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
