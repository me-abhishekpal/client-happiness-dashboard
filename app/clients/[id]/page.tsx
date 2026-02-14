// app/clients/[id]/page.tsx
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Save, Shield, User, AlertTriangle, FileText, Upload, Eye } from 'lucide-react';
import Link from 'next/link';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

async function getClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id: decodeURIComponent(id) },
    include: {
      owner: true,
      accountable: true,
      department: true,
      updates: {
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      },
      evidenceFiles: true,
      escalations: {
        where: { status: 'OPEN' },
        include: { owner: true }
      }
    }
  });
  if (!client) return null;
  return client;
}

// SERVER ACTION: Update Status & Handle Files
async function updateStatus(formData: FormData) {
  'use server';
  
  const clientId = formData.get('clientId') as string;
  const newStatus = formData.get('status') as string;
  const comments = formData.get('comments') as string;
  const nextSteps = formData.get('nextSteps') as string;
  const isOnWatchlist = formData.get('isOnWatchlist') === 'on';
  const file = formData.get('evidence') as File;

  // Simulate Admin User
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) throw new Error("No admin found");

  // 1. Mandatory Comment Check
  if (!comments || comments.trim().length < 5) {
    throw new Error("Comments are mandatory for status updates.");
  }

  // 2. Handle File Upload (Save to public/uploads)
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), 'public/uploads', fileName);
    
    // Ensure directory exists (basic check)
    // await mkdir(join(process.cwd(), 'public/uploads'), { recursive: true });
    await writeFile(path, buffer);

    await prisma.file.create({
      data: {
        name: file.name,
        path: `/uploads/${fileName}`,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        clientId,
        uploadedById: admin.id
      }
    });
  }

  // 3. Create Audit Log
  await prisma.statusUpdate.create({
    data: {
      clientId,
      userId: admin.id,
      oldStatus: 'UNKNOWN', // Ideally fetch first
      newStatus,
      comments,
      nextSteps
    }
  });

  // 4. Update Client Record
  await prisma.client.update({
    where: { id: clientId },
    data: {
      status: newStatus,
      lastUpdated: new Date(),
      isOnWatchlist
    }
  });

  // 5. Notifications (Mock)
  // await sendNotification(...)
}

// SERVER ACTION: Create Escalation
async function createEscalation(formData: FormData) {
  'use server';
  const clientId = formData.get('clientId') as string;
  const title = formData.get('title') as string;
  const severity = formData.get('severity') as string;
  
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  await prisma.escalation.create({
    data: {
      clientId,
      title,
      severity,
      status: 'OPEN',
      ownerId: admin!.id
    }
  });
}

export default async function ClientDetail({ params }: { params: { id: string } }) {
  const client = await getClient(params.id);

  if (!client) notFound();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Update Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Update Card */}
          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  {client.name}
                  {client.isOnWatchlist && (
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Eye className="h-3 w-3 mr-1" /> Watchlist
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Owner: {client.owner?.name} • {client.serviceType}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold
                ${client.status === 'RED' ? 'bg-red-100 text-red-800' : 
                  client.status === 'AMBER' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'}`}>
                {client.status}
              </span>
            </div>

            <form action={updateStatus} className="space-y-6">
              <input type="hidden" name="clientId" value={client.id} />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Status</label>
                  <select 
                    name="status" 
                    defaultValue={client.status}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="GREEN">GREEN - On Track</option>
                    <option value="AMBER">AMBER - Needs Attention</option>
                    <option value="RED">RED - Critical / At Risk</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <div className="flex items-center h-5">
                    <input
                      id="watchlist"
                      name="isOnWatchlist"
                      type="checkbox"
                      defaultChecked={client.isOnWatchlist}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="watchlist" className="font-medium text-gray-700">Add to Watchlist</label>
                    <p className="text-gray-500">Flag as "Verge of RED"</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reason for Update <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="comments"
                  required
                  rows={4} 
                  className="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Explain why the status changed. Be specific."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Evidence (Optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input id="file-upload" name="evidence" type="file" className="sr-only" accept=".msg,.eml,.pdf,.png,.jpg" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">MSG, EML, PDF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="submit" className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Save className="h-4 w-4 mr-2" />
                  Update Status
                </button>
              </div>
            </form>
          </div>

          {/* History Timeline */}
          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Trail</h3>
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
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Updated to <span className="font-medium text-gray-900">{update.newStatus}</span> by {update.user.name}
                              </p>
                              {update.comments && (
                                <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                                  {update.comments}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={update.createdAt.toISOString()}>
                                {update.createdAt.toLocaleDateString()}
                              </time>
                            </div>
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

        {/* RIGHT COLUMN: Metadata & Escalations */}
        <div className="space-y-6">
          
          {/* Active Escalations */}
          <div className="bg-red-50 shadow-sm rounded-xl p-6 border border-red-200">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" /> Active Escalations
            </h3>
            
            {client.escalations.length > 0 ? (
              <ul className="space-y-3 mb-4">
                {client.escalations.map(esc => (
                  <li key={esc.id} className="bg-white p-3 rounded-md border border-red-100 shadow-sm">
                    <p className="font-medium text-red-800 text-sm">{esc.title}</p>
                    <span className="text-xs text-gray-500 mt-1 block">Severity: {esc.severity}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-red-700 mb-4">No active escalations.</p>
            )}

            <form action={createEscalation} className="mt-4 pt-4 border-t border-red-100">
              <input type="hidden" name="clientId" value={client.id} />
              <input 
                name="title" 
                placeholder="New Escalation Title..." 
                className="block w-full text-sm border-gray-300 rounded-md mb-2"
                required
              />
              <select name="severity" className="block w-full text-sm border-gray-300 rounded-md mb-2">
                <option value="HIGH">High Severity</option>
                <option value="MEDIUM">Medium Severity</option>
              </select>
              <button type="submit" className="w-full text-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
                Raise Escalation
              </button>
            </form>
          </div>

          {/* Evidence Files */}
          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" /> Evidence
            </h3>
            {client.evidenceFiles.length > 0 ? (
              <ul className="space-y-2">
                {client.evidenceFiles.map(file => (
                  <li key={file.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                    <a href={file.path} target="_blank" className="text-sm text-blue-600 hover:underline truncate max-w-[200px]">
                      {file.name}
                    </a>
                    <span className="text-xs text-gray-400">{file.type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No files uploaded.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
