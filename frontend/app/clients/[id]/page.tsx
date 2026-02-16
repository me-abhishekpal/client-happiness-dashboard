// app/clients/[id]/page.tsx
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Shield, User, AlertTriangle, FileText, Upload, Eye, Download } from 'lucide-react';
import Link from 'next/link';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';
import { sendNotification } from '@/lib/notifications';
import { UpdateStatusForm, EscalationForm, DeleteClientForm } from '@/components/ClientForms';
import { deleteClient } from '@/app/actions/client';
import { getCurrentUser } from '@/lib/session';

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
        take: 5,  // Only get 5 most recent
        include: {
          user: true,
          files: true  // Include linked evidence files
        }
      },
      evidenceFiles: {
        orderBy: { createdAt: 'desc' },
        include: {
          statusUpdate: {
            include: { user: true }
          }
        }
      },
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
  console.log("⚡ SERVER ACTION: updateStatus called");

  const clientId = formData.get('clientId') as string;
  const newStatus = formData.get('status') as string;
  const comments = formData.get('comments') as string;
  const nextSteps = formData.get('nextSteps') as string;
  const isOnWatchlist = formData.get('isOnWatchlist') === 'on';
  const file = formData.get('evidence') as File;

  const admin = await getCurrentUser(); // Get REAL user
  if (!admin) throw new Error("No user found");

  // 1. Mandatory Comment Check
  if (!comments || comments.trim().length < 5) {
    throw new Error("Comments are mandatory for status updates.");
  }

  // 2. Get old status
  const oldClient = await prisma.client.findUnique({ where: { id: clientId } });

  // 3. Create Audit Log FIRST (so we can link file to it)
  const statusUpdate = await prisma.statusUpdate.create({
    data: {
      clientId,
      userId: admin.id,
      oldStatus: oldClient?.status || 'UNKNOWN',
      newStatus,
      comments,
      nextSteps
    }
  });

  // 4. Handle File Upload and link to status update
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;

    // Store in database/uploads directory
    const uploadsDir = join(process.cwd(), '..', 'database', 'uploads');
    const filePath = join(uploadsDir, fileName);

    // Create directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    await writeFile(filePath, buffer);

    await prisma.file.create({
      data: {
        name: file.name,
        path: `../database/uploads/${fileName}`,  // Relative path from frontend
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        clientId,
        uploadedById: admin.id,
        statusUpdateId: statusUpdate.id  // Link file to this status update
      }
    });
  }

  // 5. Update Client Record
  await prisma.client.update({
    where: { id: clientId },
    data: {
      status: newStatus,
      lastUpdated: new Date(),
      isOnWatchlist
    }
  });

  // 5. Send Notification
  if (newStatus === 'RED' || oldClient?.status !== newStatus) {
    const fullClient = await prisma.client.findUnique({
      where: { id: clientId },
      include: { owner: true, accountable: true }
    });

    const recipients = [
      admin.email,
      fullClient?.owner?.email,
      fullClient?.accountable?.email
    ].filter(Boolean) as string[];

    await sendNotification({
      type: newStatus === 'RED' ? 'RED_ALERT' : 'STATUS_CHANGE',
      clientName: fullClient?.name || clientId,
      oldStatus: oldClient?.status || 'UNKNOWN',
      newStatus,
      user: admin.name || 'User',
      comments,
      recipients
    });
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath('/dashboard');
}

// SERVER ACTION: Create Escalation
async function createEscalation(formData: FormData) {
  'use server';
  const clientId = formData.get('clientId') as string;
  const title = formData.get('title') as string;
  const severity = formData.get('severity') as string;

  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.escalation.create({
    data: {
      clientId,
      title,
      severity,
      status: 'OPEN',
      ownerId: user.id
    }
  });

  revalidatePath(`/clients/${clientId}`);
}

export default async function ClientDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const client = await getClient(params.id);
  const user = await getCurrentUser();

  if (!client) notFound();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
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

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-600 mb-6">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">Service</span>
                {client.serviceType || '-'}
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">Engagement</span>
                {client.currentEngagement || '-'} ({client.engagementStatus || 'OPEN'})
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">Resource</span>
                {client.resourceLink ? (
                  <a href={client.resourceLink} target="_blank" className="text-blue-600 hover:underline break-all">
                    Link
                  </a>
                ) : '-'}
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">Last Update</span>
                {client.lastUpdated.toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">CSM</span>
                <div className="font-medium text-gray-900">{client.csmName || '-'}</div>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">PM/TPM</span>
                <div className="font-medium text-gray-900">{client.pmName || '-'}</div>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">vCISO</span>
                <div className="font-medium text-gray-900">{client.vcisoName || '-'}</div>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Accountable</span>
                <div className="font-medium text-gray-900">{client.accountable?.name || '-'}</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {client.nextSteps && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Next Steps / Actions</h4>
                  <p className="text-sm text-blue-900 whitespace-pre-wrap">{client.nextSteps}</p>
                </div>
              )}
              {client.csmPmComments && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">CSM/PM Comments</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100 whitespace-pre-wrap">{client.csmPmComments}</p>
                </div>
              )}
              {client.executiveComments && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Executive Comments</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100 whitespace-pre-wrap">{client.executiveComments}</p>
                </div>
              )}
            </div>

            <UpdateStatusForm client={client} action={updateStatus} />
          </div>

          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
              <Link
                href={`/clients/${client.id}/audit-trail`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Show All →
              </Link>
            </div>
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
                                  {update.createdAt.toLocaleDateString()}
                                </time>
                              </div>
                            </div>
                            {update.comments && (
                              <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                                {update.comments}
                              </p>
                            )}
                            {update.files && update.files.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
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

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
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

            <EscalationForm clientId={client.id} action={createEscalation} />
          </div>

          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" /> Evidence Files
            </h3>
            {client.evidenceFiles.length > 0 ? (
              <ul className="space-y-3">
                {client.evidenceFiles.map(file => (
                  <li key={file.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <a href={file.path} target="_blank" className="text-sm font-medium text-blue-600 hover:underline block mb-1">
                      <Download className="h-3 w-3 inline mr-1" />
                      {file.name}
                    </a>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div>Uploaded: {file.createdAt.toLocaleString()}</div>
                      {file.statusUpdate ? (
                        <div className="text-blue-600">
                          Linked to: {file.statusUpdate.newStatus} update by {file.statusUpdate.user.name}
                        </div>
                      ) : (
                        <div className="text-gray-400 italic">Not linked to any update</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No files uploaded.</p>
            )}
          </div>

          {/* DELETE BUTTON (Admin Only) */}
          {user?.role === 'ADMIN' && (
            <div className="bg-white shadow-sm rounded-xl p-6 border border-red-100">
              <h3 className="text-sm font-bold text-red-900 mb-2">Danger Zone</h3>
              <p className="text-xs text-gray-500">Irreversible action.</p>
              <DeleteClientForm clientId={client.id} action={deleteClient} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
