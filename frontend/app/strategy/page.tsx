import { ComingSoon } from '@/components/ComingSoon';
import { requirePermission } from '@/lib/rbac';

export default async function StrategyPage() {
    await requirePermission('strategy:view');
    return <ComingSoon title="Strategic Planning" description="Upcoming feature: map out and track long-term strategies, vCISO roadmaps, and client success milestones." />;
}
