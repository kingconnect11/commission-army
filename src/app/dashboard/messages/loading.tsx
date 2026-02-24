export default function MessagesLoading() {
  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl overflow-hidden border border-border bg-surface animate-pulse">
      <div className="w-full sm:w-80 shrink-0 border-r border-border-subtle p-4 space-y-3">
        <div className="h-5 bg-navy-800 rounded w-1/3" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-navy-800 rounded-lg" />
        ))}
      </div>
      <div className="flex-1 bg-navy-950" />
    </div>
  );
}
