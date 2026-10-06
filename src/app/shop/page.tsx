import BookButton from "@/components/BookButton";
import Reveals from "@/components/Reveals";
import ShopCheckout from "@/components/ShopCheckout";
import type { Metadata } from "next";
import Image from "next/image";
import { price, products } from "@/content/shop";
import { site } from "@/content/site";
import "./shop.css";

export const metadata: Metadata = {
  title: "Shop",
  description: "Models, materials and loops from Studio Deadzolt, the same files used on client work. Instant download.",
  alternates: { canonical: "/shop" },
};

// The shop: a short intro (the star holds the top right), then the products
// as numbered plates, each with its price and a buy button that opens
// Gumroad's checkout over the site.
export default function ShopPage() {
  return (
    <section className="page shop">
      <Reveals />
      <ShopCheckout />
      <header className="sh-head">
        <p className="label" data-enter>
          Shop · {site.name}
        </p>
        <h1 className="display sh-title" data-split>
          Files from the studio, <em>for your own frames.</em>
        </h1>
        <p className="sh-lede" data-enter>
          The models, materials and loops behind the client work. Pay once and download straight
          away.
        </p>
      </header>

      <ol className="sh-grid" data-stagger>
        {products.map((p, i) => (
          <li className="sh-item" key={p.slug} data-soon={p.gumroad ? undefined : ""}>
            <div className="sh-plate">
              <Image src={p.image} alt={p.alt} width={1600} height={1600} sizes="(max-width: 760px) 100vw, 50vw" />
              <span className="label sh-num">No. {String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="sh-body">
              <div className="sh-row">
                <h2 className="sh-name">{p.title}</h2>
                <span className="sh-price">{price(p)}</span>
              </div>
              <p className="sh-line">{p.line}</p>
              <div className="sh-foot">
                <span className="label">{p.format}</span>
                {p.gumroad ? (
                  <a
                    className="button button-small sh-buy"
                    href={p.gumroad}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-gumroad-overlay-checkout="true"
                    data-product={p.slug}
                  >
                    Buy · {price(p)}
                  </a>
                ) : (
                  <span className="label sh-soon">Coming soon</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="label sh-note" data-reveal>
        Checkout by Gumroad · prices in USD · files arrive by email the moment you pay
      </p>

      <div className="sh-close" data-reveal>
        <p className="sh-close-line">Need it made for your launch instead? {site.ctaNote}</p>
        <BookButton from="shop" />
      </div>
    </section>
  );
}
