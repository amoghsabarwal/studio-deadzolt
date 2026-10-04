import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section page-top">
      <h1>Lost in the void.</h1>
      <p className="lede">This page doesn&apos;t exist, or it moved.</p>
      <Link href="/" className="button">
        Back to the start
      </Link>
    </section>
  );
}
