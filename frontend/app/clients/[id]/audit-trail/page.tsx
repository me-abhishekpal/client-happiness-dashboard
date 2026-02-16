// app/clients/[id]/audit-trail/page.tsx
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Download } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

async function getClientAuditTrail(id: string) {
    const client = await prisma.client.findUnique({
        where: { id: decodeURIComponent(id) },
        include: {
            updates: {
                orderBy: { createdAt: 'desc' },
                include: {
                    user: true,
                    files: true
                }
            }
        }
    });
    if (!client) return null;
    return client;
}

export default async function AuditTrailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const client = await getClientAuditTrail(params.id);

    if (!client) notFound();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Link href={`/clients/${client.id}`} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Client
            </Link>

            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{client.name} - Full Audit Trail</h1>
                <p className="text-sm text-gray-500 mb-6">Complete history of all status updates</p>

                <div className="flow-root">
                    <ul className="-mb-8">
                        {client.updates.length === 0 ? (
                            <p className="text-gray-500 italic">No history yet.</p>
                        ) : (
                            client.updates.map((update, idx) => (
                                <li key={update.id}>
                                    <div className="relative pb-8">
                                        {idx !== client.updates.length - 1 ? (
                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white 
                          ${update.newStatus === 'RED' ? 'bg-red-500' : update.newStatus === 'AMBER' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                                    <Clock className="h-5 w-5 text-white" />
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5">
                                                <div className="flex justify-between space-x-4 mb-2">
                                                    <p className="text-sm text-gray-500">
                                                        Updated to <span className="font-medium text-gray-900">{update.newStatus}</span> by {update.user.name}
                                                    </p>
                                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                        <time dateTime={update.createdAt.toISOString()}>
                                                            {update.createdAt.toLocaleString()}
                                                        </time>
                                                    </div>
                                                </div>
                                                {update.comments && (
                                                    <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100 whitespace-pre-wrap">
                                                        {update.comments}
                                                    </p>
                                                )}
                                                {update.nextSteps && (
                                                    <div className="mt-2 text-sm bg-blue-50 p-3 rounded-md border border-blue-100">
                                                        <span className="font-semibold text-blue-900">Next Steps:</span>
                                                        <p className="text-blue-800 mt-1 whitespace-pre-wrap">{update.nextSteps}</p>
                                                    </div>
                                                )}
                                                {update.files && update.files.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <span className="text-xs font-semibold text-gray-500 w-full">Evidence Files:</span>
                                                        {update.files.map(file => (
                                                            <a
                                                                key={file.id}
                                                                href={file.path}
                                                                target="_blank"
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-md hover:bg-blue-100 border border-blue-200"
                                                            >
                                                                <Download className="h-3 w-3" />
                                                                {file.name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
