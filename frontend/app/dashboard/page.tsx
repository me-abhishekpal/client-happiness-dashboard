// app/dashboard/page.tsx
import { prisma } from '@/lib/prisma-tenant';
import { TopNav } from '@/components/TopNav';
import { DashboardStats } from '@/components/DashboardStats';
import { ActionableInsights, InsightData } from '@/components/ActionableInsights';
import {
  HappinessTrend,
  DisasterWarning,
  KudosNPS,
  DeptPerformance,
  EscalationData,
  PerformanceDept
} from '@/components/DashboardCharts';
import { Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';


import { requirePermission } from '@/lib/rbac';


export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  await requirePermission('dashboard:view');
  // 1. Fetch comprehensive data
  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    include: {
      owner: true,
      department: true,
      accountable: true,
      service: true,
      currentEngagement: true,
      escalations: {
        where: { status: 'OPEN' }
      }
    }
  });

  const openEscalationsRaw = await prisma.escalation.findMany({
    where: {
      status: 'OPEN',
      client: { deletedAt: null }
    },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const departments = await prisma.department.findMany({
    include: {
      clients: {
        where: { deletedAt: null }
      }
    }
  });

  // 2. Calculate Top Stats
  const counts = {
    critical: clients.filter(c => c.status === 'RED').length,
    atRisk: clients.filter(c => c.status === 'AMBER').length,
    healthy: clients.filter(c => c.status === 'GREEN' || c.status === 'UNKNOWN').length,
  };

  // 3. Format Actionable Insights (Clients with most risk or recent changes)
  const actionableInsights: InsightData[] = clients
    .filter(c => c.status === 'RED' || c.status === 'AMBER' || c.isOnWatchlist)
    .slice(0, 4)
    .map(c => ({
      id: c.id,
      name: c.name,
      industry: c.service?.name || 'General',
      size: c.currentEngagement?.name || 'Standard',
      revenue: c.revenue
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(c.revenue)
        : 'TBD',
      nps: c.nps,
      kudos: c.kudos,
      lastTouch: formatDistanceToNow(new Date(c.lastUpdated), { addSuffix: true }),
      status: c.status as any
    }));

  // 4. Format Escalations for Disaster Warning
  const escalations: EscalationData[] = openEscalationsRaw.map(e => ({
    id: e.id,
    title: e.title,
    severity: e.severity as any,
    clientName: e.client.name
  }));

  // 5. Calculate Departmental Performance
  const performance: PerformanceDept[] = departments.map(d => {
    const total = d.clients.length;
    if (total === 0) return { name: d.name, value: 0, color: 'bg-slate-300' };

    // Performance score: % of clients NOT in RED status
    const healthyCount = d.clients.filter(c => c.status !== 'RED').length;
    const score = Math.round((healthyCount / total) * 100);

    let color = 'bg-emerald-400';
    if (score < 50) color = 'bg-red-400';
    else if (score < 80) color = 'bg-amber-400';
    else if (score < 90) color = 'bg-blue-500';

    return { name: d.name, value: score, color };
  }).sort((a, b) => b.value - a.value);

  return (
    <div className="min-h-screen pb-12">
      <TopNav />

      <main className="max-w-[1600px] mx-auto px-8 mt-10">
        <div className="grid grid-cols-1 gap-10">

          {/* Top Metric Cards */}
          <DashboardStats counts={counts} />

          {/* Middle Row: Actionable Insights & Happiness Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <ActionableInsights insights={actionableInsights} />
            </div>
            <div className="lg:col-span-1">
              <HappinessTrend />
            </div>
          </div>

          {/* Bottom Row: Disaster Warning, Kudos/NPS, Dept. Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <DisasterWarning escalations={escalations} />
            <KudosNPS nps={72} kudos={15} />
            <DeptPerformance performance={performance} />
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-[#1E293B] text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white hover:scale-110 transition-transform z-50 group">
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
      </button>
    </div>
  );
}
