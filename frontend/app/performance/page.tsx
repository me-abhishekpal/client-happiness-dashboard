import { ComingSoon } from '@/components/ComingSoon';
import { requirePermission } from '@/lib/rbac';

export default async function PerformancePage() {
    await requirePermission('performance:view');
    return <ComingSoon title="Performance Metrics" description="We're building an advanced SLA and health-score tracking dashboard here. Check back soon." />;
}
