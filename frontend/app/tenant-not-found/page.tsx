// app/tenant-not-found/page.tsx
// Page shown when tenant cannot be identified from hostname

export default function TenantNotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-10 h-10 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Tenant Not Found
                        </h1>
                        <p className="text-slate-600">
                            The organization you're trying to access doesn't exist or has been deactivated.
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-slate-700 mb-2">
                            <strong>Looking for your organization?</strong>
                        </p>
                        <p className="text-xs text-slate-600">
                            Check your subdomain or custom domain URL, or contact your administrator for the correct link.
                        </p>
                    </div>

                    <a
                        href="https://rag.abhee.org"
                        className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Go to Main Site
                    </a>
                </div>
            </div>
        </div>
    );
}
