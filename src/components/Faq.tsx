import { faq } from "@/content/site";

// The questions people ask before booking, answered where they'd ask them.
export default function Faq() {
  return (
    <section id="faq" className="faq" aria-labelledby="faq-title">
      <div className="section-head">
        <p className="label">Questions</p>
        <h2 id="faq-title" className="section-title">
          Before you book
        </h2>
      </div>
      <div className="faq-list">
        {faq.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>
              {item.q}
              <span className="faq-mark" aria-hidden="true" />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
