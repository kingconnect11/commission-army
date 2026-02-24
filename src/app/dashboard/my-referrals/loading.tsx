export default function MyReferralsLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="mb-6">
        <div className="h-8 bg-navy-800 rounded w-1/3 mb-2" />
        <div className="h-4 bg-navy-800 rounded w-2/3" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-5 h-28" />
        ))}
      </div>
    </div>
  );
}
