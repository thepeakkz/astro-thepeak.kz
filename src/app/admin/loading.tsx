export default function AdminLoading() {
  return (
    <main className="peak-admin__main" aria-label="Загрузка CMS">
      <div className="peak-admin__loading-header peak-admin__skeleton" />
      <div className="peak-admin__metric-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="peak-admin__metric-card peak-admin__skeleton-card" />
        ))}
      </div>
      <div className="peak-admin__loading-table" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="peak-admin__loading-row peak-admin__skeleton" />
        ))}
      </div>
    </main>
  );
}
