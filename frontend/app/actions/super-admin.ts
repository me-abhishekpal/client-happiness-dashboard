"use server";

import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';
import { prismaBase } from '@/lib/prisma-base';
import { sendEmail } from '@/lib/email';
import { generateInviteEmail } from '@/lib/email-templates';

import { redirect } from 'next/navigation';

export async function createTenantAdmin(tenantId: string, formData: FormData) {
    console.log(`🚀 [SuperAdmin] Starting createTenantAdmin for tenant: ${tenantId}`);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    console.log(`📋 [SuperAdmin] Form Data - Name: ${name}, Email: ${email}`);

    if (!name || !email) {
        console.error('❌ [SuperAdmin] Missing name or email');
        return { success: false, error: 'Name and email are required' };
    }

    try {
        const pb = prismaBase as any;

        // 0. Fetch tenant info for email branding and URL
        console.log(`🔍 [SuperAdmin] Fetching tenant info for: ${tenantId}`);
        const tenant = await pb.tenant.findUnique({
            where: { id: tenantId }
        });

        if (!tenant) {
            console.error(`❌ [SuperAdmin] Tenant not found: ${tenantId}`);
            return { success: false, error: 'Tenant not found' };
        }
        console.log(`✅ [SuperAdmin] Tenant found: ${tenant.name} (${tenant.slug})`);

        // 1. Ensure ADMIN role exists for this tenant
        console.log(`🔍 [SuperAdmin] Ensuring ADMIN role exists...`);
        let adminRole = await pb.role.findFirst({
            where: { tenantId, name: 'ADMIN' }
        });

        if (!adminRole) {
            console.log(`✨ [SuperAdmin] Creating missing ADMIN role for tenant...`);
            adminRole = await pb.role.create({
                data: {
                    name: 'ADMIN',
                    description: 'Tenant Administrator',
                    permissions: JSON.stringify(['*']),
                    tenantId
                }
            });
        }
        console.log(`✅ [SuperAdmin] Admin role ID: ${adminRole.id}`);

        // 1.5 Check for existing user in this tenant (including deleted ones to prevent unique constraint crash)
        console.log(`🔍 [SuperAdmin] Checking for existing user (active or deleted): ${email}`);
        const existingUser = await pb.user.findFirst({
            where: { email, tenantId }
        });

        const inviteToken = randomBytes(32).toString('hex');
        const inviteTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        if (existingUser) {
            if (existingUser.deletedAt) {
                console.log(`♻️ [SuperAdmin] User found but was deleted. Restoring instead of creating: ${email}`);
                await pb.user.update({
                    where: { id: existingUser.id },
                    data: {
                        deletedAt: null,
                        role: 'ADMIN',
                        roleId: adminRole.id,
                        inviteToken,
                        inviteTokenExpiry
                    }
                });
            } else {
                console.warn(`[SuperAdmin] User ${email} already exists and is active in tenant ${tenantId}`);
                return { success: false, error: 'User already exists in this organization' };
            }
        } else {
            // 2. Create User
            console.log(`👤 [SuperAdmin] Creating new user in database...`);
            await pb.user.create({
                data: {
                    name,
                    email,
                    tenantId,
                    role: 'ADMIN',
                    roleId: adminRole.id,
                    inviteToken,
                    inviteTokenExpiry
                }
            });
        }
        console.log(`✅ [SuperAdmin] User database record ready for: ${email}`);

        // 3. Send Invitation Email
        console.log(`📧 [SuperAdmin] Preparing invitation email...`);
        try {
            // Construct tenant-specific base URL for the invitation
            const baseUrl = tenant.customDomain
                ? `https://${tenant.customDomain}`
                : `https://${tenant.subdomain}-rag.abhee.org`;

            const { html, text } = generateInviteEmail({
                userName: name,
                inviteToken,
                baseUrl
            });

            await sendEmail({
                to: email,
                subject: `✨ Welcome to ${tenant.name} on Client Happiness`,
                text,
                html
            });
            console.log(`✅ [SuperAdmin] Invitation email sent to ${email} for tenant ${tenant.slug}`);
        } catch (emailError) {
            console.error('⚠️ [SuperAdmin] Failed to send invitation email:', emailError);
        }

        console.log(`✅ [SuperAdmin] Admin ${email} created for tenant ${tenantId}`);
        revalidatePath(`/super-admin/tenants/${tenantId}`);
        return { success: true };
    } catch (error) {
        console.error('❌ [SuperAdmin] Failed to create tenant admin:', error);
        return { success: false, error: 'Failed to create administrator' };
    }
}

export async function deleteTenantAdmin(tenantId: string, formData: FormData) {
    const adminId = formData.get('adminId') as string;

    if (!adminId) {
        return { success: false, error: 'Admin ID is required' };
    }

    try {
        const pb = prismaBase as any;

        await pb.user.update({
            where: { id: adminId },
            data: {
                deletedAt: new Date(),
                email: `deleted-${adminId}-${Date.now()}@deleted.com` // Free up email
            }
        });

        revalidatePath(`/super-admin/tenants/${tenantId}`);
        return { success: true };
    } catch (error) {
        console.error('❌ [SuperAdmin] Failed to delete tenant admin:', error);
        return { success: false, error: 'Failed to delete administrator' };
    }
}

export async function updateTenantAction(tenantId: string, formData: FormData) {
    const name = formData.get('name') as string;
    const customDomain = formData.get('customDomain') as string;
    const allowedEmailDomain = formData.get('allowedEmailDomain') as string;
    const plan = formData.get('plan') as string;
    const status = formData.get('status') as string;
    const domainVerified = formData.get('domainVerified') === 'on';

    try {
        const pb = prismaBase as any;
        await pb.tenant.update({
            where: { id: tenantId },
            data: {
                name,
                customDomain: customDomain || null,
                allowedEmailDomain,
                plan,
                status,
                domainVerified
            }
        });

        revalidatePath('/super-admin');
        revalidatePath(`/super-admin/tenants/${tenantId}`);
    } catch (error) {
        console.error('❌ [SuperAdmin] Failed to update tenant:', error);
        return { success: false, error: 'Failed to update tenant configuration' };
    }

    redirect('/super-admin');
}

export async function createTenantWithAdmin(formData: FormData) {
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const subdomain = formData.get('subdomain') as string;
    const allowedEmailDomain = formData.get('allowedEmailDomain') as string;
    const plan = formData.get('plan') as string;

    const adminName = formData.get('adminName') as string;
    const adminEmail = formData.get('adminEmail') as string;

    if (!name || !slug || !subdomain || !adminName || !adminEmail) {
        throw new Error('All required fields must be filled');
    }

    try {
        const pb = prismaBase as any;

        // Perform in transaction
        const result = await pb.$transaction(async (tx: any) => {
            // 1. Create Tenant
            const tenant = await tx.tenant.create({
                data: {
                    name,
                    slug,
                    subdomain,
                    allowedEmailDomain,
                    plan,
                    status: 'active'
                }
            });

            // 2. Create default ADMIN role for tenant
            const adminRole = await tx.role.create({
                data: {
                    name: 'ADMIN',
                    description: 'Tenant Administrator',
                    permissions: JSON.stringify(['*']),
                    tenantId: tenant.id
                }
            });

            // 3. Create Admin User
            const inviteToken = randomBytes(32).toString('hex');
            const inviteTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await tx.user.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    tenantId: tenant.id,
                    role: 'ADMIN',
                    roleId: adminRole.id,
                    inviteToken,
                    inviteTokenExpiry
                }
            });

            return { tenant, inviteToken };
        });

        // 4. Send Invitation Email (outside transaction)
        try {
            const baseUrl = `https://${result.tenant.subdomain}-rag.abhee.org`;
            const { html, text } = generateInviteEmail({
                userName: adminName,
                inviteToken: result.inviteToken,
                baseUrl
            });

            await sendEmail({
                to: adminEmail,
                subject: `✨ Welcome to ${result.tenant.name} on Client Happiness`,
                text,
                html
            });
        } catch (emailError) {
            console.error('⚠️ [SuperAdmin] Failed to send invitation email:', emailError);
        }

        revalidatePath('/super-admin');
        redirect('/super-admin');
    } catch (error: any) {
        if (error.digest?.includes('NEXT_REDIRECT')) throw error;

        console.error('❌ [SuperAdmin] Failed to create tenant and admin:', error);
        if (error.code === 'P2002') {
            throw new Error('A tenant with this slug or subdomain already exists.');
        }
        throw new Error('Failed to create organization');
    }
}
