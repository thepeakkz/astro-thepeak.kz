export default function AdminLoading() {
  return (
    <main className="peak-admin__main space-y-6" aria-label="Загрузка CMS">
      {/* Заголовок скелетон */}
      <div className="space-y-2">
        <div className="h-4 w-28 bg-slate-200 rounded-md animate-pulse" />
        <div className="h-8 w-60 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      {/* Метрики скелетон */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 bg-white border border-slate-200 rounded-2xl p-5 animate-pulse space-y-3 shadow-xs">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="size-6 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-7 w-20 bg-slate-200 rounded-md" />
          </div>
        ))}
      </div>

      {/* Таблица скелетон */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs" aria-hidden="true">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="space-y-2 flex-1 max-w-sm">
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
              <div className="h-4 w-32 bg-slate-100 rounded hidden sm:block" />
              <div className="flex gap-2">
                <div className="size-7 bg-slate-100 rounded-lg" />
                <div className="size-7 bg-slate-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
