"use client";

import { useId, useState } from "react";
import { faq } from "@/content/site";

// The questions people ask before booking, answered where they'd ask them.
// Each answer opens on a grid row, and its five dots turn into a spinning
// ring, the same dots as the booking button's orbit.
export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();
  return (
    <section id="faq" className="faq" aria-labelledby={`${id}-title`}>
      <div className="section-head">
        <p className="label" data-scramble>
          Questions
        </p>
        <h2 id={`${id}-title`} className="section-title" data-split>
          Before you book
        </h2>
      </div>
      <div className="faq-list">
        {faq.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="faq-item" data-open={isOpen || undefined} data-hairline="bottom">
              <h3>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={isOpen}
                  aria-controls={`${id}-a${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {item.q}
                  <span className="faq-dots" aria-hidden="true">
                    {Array.from({ length: 8 }, (_, k) => (
                      <i key={k} style={{ "--i": k } as React.CSSProperties} />
                    ))}
                  </span>
                </button>
              </h3>
              <div id={`${id}-a${i}`} className="faq-a" role="region" inert={!isOpen}>
                <div>
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
