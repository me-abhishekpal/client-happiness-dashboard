'use client';

import { Filter, Search, Download } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exportClientsToCSV } from '@/app/actions/export';
import { useState } from 'react';

const STATUSES = ['RED', 'AMBER', 'GREEN'];

export function ClientListFilter({ currentStatus, clientCount }: { currentStatus: string; clientCount: number }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [exporting, setExporting] = useState(false);

    const handleStatusFilter = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status) {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        router.push(`/clients?${params.toString()}`);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const csv = await exportClientsToCSV(currentStatus || undefined);

            // Create blob and download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `clients-export-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export clients');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center flex-1 mr-4">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search clients..."
                    className="border-none focus:ring-0 text-sm text-gray-600 w-full"
                />
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                    <Download className="h-4 w-4" />
                    {exporting ? 'Exporting...' : 'Export CSV'}
                </button>

                <Filter className="h-4 w-4 text-slate-400" />
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Status:</label>
                <select
                    value={currentStatus}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="rounded-lg border-slate-200 shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">All</option>
                    {STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
                {currentStatus && (
                    <span className="text-sm text-slate-500">
                        ({clientCount})
                    </span>
                )}
            </div>
        </div>
    );
}
