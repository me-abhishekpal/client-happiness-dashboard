import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AppShell } from '@/components/AppShell';
import { getCurrentUser } from '@/lib/session';
import { getCurrentTenant, getTenantBranding } from '@/lib/tenant-context';

export async function generateMetadata() {
  const tenant = await getCurrentTenant();
  const branding = await getTenantBranding();

  return {
    title: branding?.companyName || tenant?.name || 'Client Happiness Dashboard',
    description: 'Enterprise RAG Tracking',
    icons: {
      icon: branding?.logo || '/favicon.ico',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser();
  const branding = await getTenantBranding();
  const role = user?.role;

  return (
    <html lang="en">
      <body className="bg-brand-bg text-gray-900 antialiased overflow-x-hidden">
        <Toaster position="top-right" />
        <AppShell role={role} branding={branding}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
