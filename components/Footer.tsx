import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="foot-grid">
        <Link className="foot-brand" href="/">
          GIMMIE SICK VIS
        </Link>
        <div className="foot-links">
          <Link href="/store">Store</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/about">About</Link>
          <Link href="/feedback">Feedback</Link>
        </div>
        <div className="foot-meta">&copy; 2026 Built by Maya</div>
      </div>
    </footer>
  );
}
