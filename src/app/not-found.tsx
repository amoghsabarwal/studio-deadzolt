import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page">
      <p className="label">404</p>
      <h1 className="display page-title">Lost in the void.</h1>
      <Link href="/" className="contact-link">
        back to index <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
