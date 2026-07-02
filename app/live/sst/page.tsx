import SstView from "@/components/SstView";

export const metadata = { title: "Sea temperature — DIVEBYTE" };

export default function Sst() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="dot" style={{ background: "var(--warm)" }} />
        <span className="panel-ttl">Sea surface temperature</span>
      </div>
      <div className="panel-bd">
        <SstView />
      </div>
    </div>
  );
}
