import { PLAN_TIERS } from "../planCatalog";
import { LogoMark, CheckGlyph } from "./Brand";

// Plan comparison used by both the standalone pricing page and the in-app
// pricing wall. Presentational only: every plan CTA is a real top-frame link
// (`target="_top"`) to Shopify's hosted managed-pricing page, where the actual
// price/cycle live and are picked. A direct anchor is used (rather than a form
// POST + reauthorize-header redirect) because a user click is a reliable user
// activation that can navigate the top frame out of the embedded iframe.
//
// Prices come from planCatalog.js and are display-only: the amount actually
// charged is set on the Partner Dashboard plans, so keep the two in sync.
export default function PricingTiers({ pricingUrl }) {
  return (
    <div className="pp-pricing">
      <header className="pp-pricing-head">
        <span className="pp-brand"><LogoMark size={26} />Pic Pace</span>
        <h1>Pick the plan that fits your catalog</h1>
        <p>
          Every plan compresses product photos to WebP. Higher plans add alt text, automatic
          compression for new products and page speed tests.
        </p>
      </header>

      <div className="pp-pricing-band">
        <div className="pp-pricing-grid">
          {PLAN_TIERS.map((tier) => (
            <div key={tier.name} className={`pp-price-card${tier.popular ? " is-popular" : ""}`}>
              <div className="pp-price-top">
                <p className="pp-price-name">{tier.name}</p>
                {tier.popular && <span className="pp-tag">Recommended</span>}
              </div>
              <p className="pp-price-tag">{tier.tagline}</p>
              <p className="pp-price-amount">
                {`$${tier.price}`}<span>/ month</span>
              </p>
              <p className="pp-price-annual">
                {tier.price === 0 ? "No card needed" : `$${tier.priceAnnual} if paid yearly`}
              </p>
              <ul className="pp-price-features">
                {tier.features.map((f) => (
                  <li key={f}><CheckGlyph />{f}</li>
                ))}
              </ul>
              <a href={pricingUrl} target="_top" className={`pp-btn ${tier.popular ? "pp-btn-primary" : "pp-btn-outline"} pp-price-cta`}>
                {tier.price === 0 ? "Use Free" : `Get ${tier.name}`}
              </a>
            </div>
          ))}
        </div>
      </div>

      <p className="pp-pricing-foot">Billing runs through Shopify. You can switch or cancel whenever you like.</p>
    </div>
  );
}
