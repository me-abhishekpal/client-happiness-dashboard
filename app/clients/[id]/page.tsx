// app/clients/[id]/page.tsx
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Shield, User, AlertTriangle, FileText, Upload, Eye } from 'lucide-react';
import Link from 'next/link';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';
import { sendNotification } from '@/lib/notifications';
import { UpdateStatusForm, EscalationForm } from '@/components/ClientForms';

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
  console.log("⚡ SERVER ACTION: updateStatus called");
  
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
    
    // Ensure directory exists
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

  // Fetch OLD status for notification
  const oldClient = await prisma.client.findUnique({ where: { id: clientId } });

  // 3. Create Audit Log
  await prisma.statusUpdate.create({
    data: {
      clientId,
      userId: admin.id,
      oldStatus: oldClient?.status || 'UNKNOWN',
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

  // 5. Send Notification
  if (newStatus === 'RED' || oldClient?.status !== newStatus) {
    // We need to fetch owner details which we didn't have in the basic query above
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
      user: admin.name || 'Admin',
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

  revalidatePath(`/clients/${clientId}`);
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

            {/* NEW FORM COMPONENT WITH TOASTS */}
            <UpdateStatusForm client={client} action={updateStatus} />
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

            {/* NEW FORM COMPONENT WITH TOASTS */}
            <EscalationForm clientId={client.id} action={createEscalation} />
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
