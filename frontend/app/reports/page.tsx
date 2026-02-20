import { requirePermission } from '@/lib/rbac';
import { FileText, Send, Calendar, Clock, Download, Plus } from 'lucide-react';

export default async function ReportsPage() {
    await requirePermission('reports:view');

    const templates = [
        {
            title: "Weekly Account Health",
            description: "Automated summary of client statuses, red accounts, and escalations sent to leadership.",
            schedule: "Every Monday at 9AM",
            recipients: "Executive Team",
            icon: Calendar
        },
        {
            title: "Monthly Escalation Review",
            description: "Detailed report on all resolved and open escalations over the trailing 30 days.",
            schedule: "1st of every Month",
            recipients: "CSM Managers",
            icon: Clock
        },
        {
            title: "Client Quarterly Business Review",
            description: "Exportable PPT deck populated with metrics and SLA delivery for specific accounts.",
            schedule: "On Demand",
            recipients: "Client Points of Contact",
            icon: Download
        }
    ];

    return (
        <div className="max-w-6xl mx-auto p-8">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Report Templates</h1>
                    <p className="text-slate-500 mt-2">Manage automated reporting schedules and export structures</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-full hover:bg-brand-secondary transition-all shadow-sm">
                    <Plus size={18} />
                    Create Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group">

                        {/* Decorative background shape */}
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-primary/5 rounded-full transition-transform group-hover:scale-150 ease-in-out duration-700" />

                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                                <template.icon className="w-6 h-6 text-brand-primary" />
                            </div>
                            <h3 className="font-bold text-slate-900 leading-tight pr-4">
                                {template.title}
                            </h3>
                        </div>

                        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1 relative z-10">
                            {template.description}
                        </p>

                        <div className="space-y-3 pt-6 border-t border-slate-50 relative z-10">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Clock size={16} className="text-slate-400" />
                                <span className="font-medium">{template.schedule}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Send size={16} className="text-slate-400" />
                                <span className="font-medium">{template.recipients}</span>
                            </div>
                        </div>

                        <div className="mt-8 relative z-10 flex gap-3">
                            <button className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-colors">
                                Edit
                            </button>
                            <button className="flex-1 py-2.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold text-sm rounded-xl transition-colors">
                                Generate
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h4 className="font-bold text-blue-900 mb-1">Coming Soon: Custom Dashboard Builder</h4>
                    <p className="text-blue-800/80 text-sm leading-relaxed max-w-3xl">
                        Based on your organization's configuration settings, the upcoming custom dashboard builder will allow you to drag and drop charts, tables, and metrics directly into your scheduled reports. Stay tuned for the Q4 rollout.
                    </p>
                </div>
            </div>
        </div>
    );
}
