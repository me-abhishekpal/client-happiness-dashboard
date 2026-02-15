import { cookies } from 'next/headers';

export default function DebugPage() {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Cookies</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(allCookies, null, 2)}
      </pre>
    </div>
  );
}
