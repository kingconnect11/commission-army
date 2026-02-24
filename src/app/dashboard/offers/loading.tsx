export default function OffersLoading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="mb-6">
        <div className="h-8 bg-navy-800 rounded w-1/3 mb-2" />
        <div className="h-4 bg-navy-800 rounded w-1/2" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-10 bg-navy-800 rounded w-48" />
        <div className="h-10 bg-navy-800 rounded w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-5 h-40" />
        ))}
      </div>
    </div>
  );
}
