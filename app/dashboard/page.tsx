// app/dashboard/page.tsx
import { ArrowUpRight, BarChart, Bell, Circle, Shield, User, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force dynamic rendering so data is always fresh
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // Fetch real data
  const clients = await prisma.client.findMany({
    include: {
      owner: true,
      accountable: true,
      department: true
    },
    orderBy: {
      lastUpdated: 'desc'
    }
  });

  // Calculate stats
  const total = clients.length;
  const red = clients.filter(c => c.status === 'RED').length;
  const amber = clients.filter(c => c.status === 'AMBER').length;
  const green = clients.filter(c => c.status === 'GREEN').length;
  // Unknown counts as green in some views, but let's separate it
  const unknown = clients.filter(c => c.status === 'UNKNOWN').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Health</span>
          </div>
        </div>
        
        <nav className="mt-6 px-4 space-y-2">
          <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md bg-blue-50 text-blue-700 font-medium">
            <BarChart className="h-5 w-5" />
            <span>Overview</span>
          </Link>
          <Link href="/clients" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md hover:text-gray-900">
            <User className="h-5 w-5" />
            <span>Clients</span>
          </Link>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-8 ml-64">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Real-time Client Health</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard/analytics" className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trends
            </Link>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              + New Status Update
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Clients', value: total, color: 'bg-blue-50 text-blue-700' },
            { label: 'Critical (RED)', value: red, color: 'bg-red-50 text-red-700' },
            { label: 'Warning (AMBER)', value: amber, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Stable (GREEN)', value: green + unknown, color: 'bg-green-50 text-green-700' },
          ].map((stat) => (
            <div key={stat.label} className={`p-6 rounded-xl border border-gray-100 bg-white shadow-sm`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <h3 className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Watchlist Section (Verge of RED) */}
        {clients.some(c => c.isOnWatchlist) && (
          <div className="bg-purple-50 rounded-xl shadow-sm border border-purple-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-purple-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-purple-900 flex items-center">
                <Eye className="h-5 w-5 mr-2" /> Watchlist (At Risk)
              </h3>
            </div>
            <table className="min-w-full divide-y divide-purple-100">
              <thead className="bg-purple-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Last Update</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-purple-50">
                {clients.filter(c => c.isOnWatchlist).map((client) => (
                  <tr key={client.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                      <Link href={`/clients/${encodeURIComponent(client.id)}`}>
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${client.status === 'RED' ? 'bg-red-100 text-red-800' : 
                          client.status === 'AMBER' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.owner?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{client.lastUpdated.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Updates Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Client Status</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner (CS/PM)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accountable</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                    <Link href={`/clients/${encodeURIComponent(client.id)}`}>
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${client.status === 'RED' ? 'bg-red-100 text-red-800' : 
                        client.status === 'AMBER' ? 'bg-yellow-100 text-yellow-800' : 
                        client.status === 'GREEN' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.owner?.name || 'Unassigned'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.accountable?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{client.department?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
