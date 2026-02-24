export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse space-y-6">
      <div className="mb-6">
        <div className="h-8 bg-navy-800 rounded w-1/4 mb-2" />
        <div className="h-4 bg-navy-800 rounded w-1/2" />
      </div>
      <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-navy-800 rounded" />
        ))}
      </div>
      <div className="bg-surface rounded-xl border border-border p-6 h-32" />
    </div>
  );
}
