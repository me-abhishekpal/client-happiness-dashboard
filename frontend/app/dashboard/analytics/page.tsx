// app/dashboard/analytics/page.tsx
import { PrismaClient } from '@prisma/client';
import { Shield, User, TrendingUp, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DeptHealthChart, StatusPieChart } from '@/components/Charts';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  // Fetch data
  const clients = await prisma.client.findMany({
    include: { department: true, owner: true }
  });

  // 1. Status Breakdown (Pie Chart Data)
  const statusData = [
    { name: 'Red', value: clients.filter(c => c.status === 'RED').length, color: '#EF4444' },
    { name: 'Amber', value: clients.filter(c => c.status === 'AMBER').length, color: '#F59E0B' },
    { name: 'Green', value: clients.filter(c => c.status === 'GREEN').length, color: '#10B981' },
    { name: 'Unknown', value: clients.filter(c => c.status === 'UNKNOWN').length, color: '#9CA3AF' },
  ];

  // 2. Department Health (Bar Chart Data)
  const deptMap = new Map();
  clients.forEach(c => {
    const dName = c.department?.name || 'Unassigned';
    if (!deptMap.has(dName)) deptMap.set(dName, { name: dName, Red: 0, Amber: 0, Green: 0, Unknown: 0 });
    const stat = deptMap.get(dName);
    if (c.status === 'RED') stat.Red++;
    else if (c.status === 'AMBER') stat.Amber++;
    else if (c.status === 'GREEN') stat.Green++;
    else stat.Unknown++;
  });
  const deptData = Array.from(deptMap.values());

  // 3. Owner Leaderboard (Who manages the most risks?)
  const ownerMap = new Map();
  clients.forEach(c => {
    if (c.status === 'RED') {
      const oName = c.owner?.name || 'Unassigned';
      if (!ownerMap.has(oName)) ownerMap.set(oName, { name: oName, Red: 0, Clients: [] });
      const stat = ownerMap.get(oName);
      stat.Red++;
      stat.Clients.push(c.name);
    }
  });
  const ownerData = Array.from(ownerMap.values())
    .sort((a, b) => b.Red - a.Red)
    .slice(0, 5); // Top 5 Riskiest Portfolios

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
          Analytics & Trends
        </h1>
        <p className="text-gray-500">Deep dive into portfolio health.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Overall Portfolio Health</h3>
          <div className="h-64 flex justify-center items-center">
             <StatusPieChart data={statusData} />
          </div>
          <div className="flex justify-center space-x-4 mt-4 text-sm text-gray-500">
            {statusData.map(s => (
              <span key={s.name} className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: s.color }} />
                {s.name}: {s.value}
              </span>
            ))}
          </div>
        </div>

        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Health by Department</h3>
          <div className="h-64">
            <DeptHealthChart data={deptData} />
          </div>
        </div>

      </div>

      {/* LEADERBOARD */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-red-700 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" /> 
          Critical Accounts Breakdown (By Owner)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownerData.map((o, i) => (
            <div key={o.name} className="p-4 border border-red-100 bg-red-50/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-900">{o.name}</h4>
                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                  {o.Red} Critical
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {o.Clients.slice(0, 3).map(client => (
                  <li key={client} className="truncate">• {client}</li>
                ))}
                {o.Clients.length > 3 && <li className="text-gray-400 italic">+ {o.Clients.length - 3} more</li>}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
