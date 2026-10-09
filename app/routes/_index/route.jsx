import { redirect } from "react-router";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  // No shop-domain form: App Store apps must be installed and opened from
  // Shopify (App Store / admin), never by typing a myshopify.com URL here.
  return null;
};

const FEATURES = [
  {
    title: "Compress Images",
    text: "Product photos are re-encoded as WebP and swapped in, with gallery order and variant images kept.",
  },
  {
    title: "Alt Text",
    text: "A short description of each product photo for screen readers and search engines, ready to review.",
  },
  {
    title: "Auto-Optimize",
    text: "New products get their photos compressed in the background as soon as they are created.",
  },
  {
    title: "Page Speed",
    text: "Google Lighthouse tests for any product page, next to the file size you removed.",
  },
];

export default function App() {
  return (
    <main className={styles.page}>
      <header className={styles.brand}>
        <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id="pp-landing-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8B62F4" />
              <stop offset="1" stopColor="#6B4FE2" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="url(#pp-landing-grad)" />
          <g fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.8 9h3.4M2.8 12h4.4M3.8 15h3.4" />
            <rect x="9.2" y="6.4" width="11" height="11.2" rx="2.2" />
            <path d="M10.6 15.6l3-3.2 2 2 1.6-1.5 2 2.1" />
          </g>
          <circle cx="17.1" cy="9.4" r="1.15" fill="#fff" />
        </svg>
        Pic Pace
      </header>

      <section className={styles.intro}>
        <h1 className={styles.heading}>Product photos that load at shopper speed</h1>
        <p className={styles.text}>
          Pic Pace compresses your Shopify product images, writes alt text for them and checks how
          quickly your product pages load.
        </p>
      </section>

      <section className={styles.band}>
        <ul className={styles.frame}>
          {FEATURES.map((f) => (
            <li key={f.title}>
              <strong>{f.title}</strong>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          Add Pic Pace from the Shopify App Store, then open it from <strong>Apps</strong> in your
          Shopify admin.
        </p>
      </section>
    </main>
  );
}
