const FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLSeVaBIkCZPh9SYDHJeJlpWE2n3tH8go57vCOg1Ppq5Wc9-tpQ/viewform";

export const metadata = { title: "Feedback — DIVEBYTE" };

export default function Feedback() {
  return (
    <>
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-ttl">Send feedback</span>
        </div>
        <div className="panel-bd" style={{ padding: 6 }}>
          <div className="sub" style={{ margin: "6px 8px 10px" }}>
            Got a suggestion, found a bug, or know a spot I should add? Let me know — or{" "}
            <a href={FORM} target="_blank" rel="noopener">
              open the form in a new tab
            </a>
            .
          </div>
          <iframe
            src={`${FORM}?embedded=true`}
            style={{ width: "100%", height: 1100, border: 0, borderRadius: 10, background: "#fff" }}
            title="Feedback form"
          />
        </div>
      </div>
    </>
  );
}
