import './globals.css';

export const metadata = {
  title: 'Client Happiness Dashboard',
  description: 'Enterprise RAG Tracking',
}

import { Toaster } from 'react-hot-toast';
import { AppShell } from '@/components/AppShell';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-brand-bg text-gray-900 antialiased overflow-x-hidden">
        <Toaster position="top-right" />
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
