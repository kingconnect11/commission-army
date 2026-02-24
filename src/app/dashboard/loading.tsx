export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-navy-800 rounded w-1/3 mb-2" />
        <div className="h-4 bg-navy-800 rounded w-1/4" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-5 h-24" />
        ))}
      </div>
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="h-4 bg-navy-800 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-navy-800/50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
