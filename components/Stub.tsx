export default function Stub({ title, note }: { title: string; note: string }) {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">{title}</span>
        <span className="panel-meta">{note}</span>
      </div>
      <div className="panel-bd" style={{ color: "var(--muted)" }}>
        This section is being ported. Check back shortly.
      </div>
    </div>
  );
}
