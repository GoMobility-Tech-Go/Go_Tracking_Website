import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center px-6">
      <div className="text-center text-white max-w-md">
        <div className="text-7xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold mb-3">Ride Not Found</h1>
        <p className="text-blue-200 mb-8 leading-relaxed">
          This tracking link is invalid or the ride has already completed. Please check the link and try again.
        </p>
        <div className="bg-white/10 rounded-xl p-5 text-left text-sm text-blue-100 mb-8">
          <p className="font-semibold mb-2">Possible reasons:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Tracking link expired (ride completed)</li>
            <li>Invalid or incomplete URL</li>
            <li>Ride was cancelled</li>
          </ul>
        </div>
        <Link href="/" className="bg-white text-primary-700 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition">
          Go to GoMobility
        </Link>
      </div>
    </div>
  );
}
