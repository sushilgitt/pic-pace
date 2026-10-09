import { useNavigate, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getBillingStateCached } from "../billing.server";
import { getUsage } from "../usage.server";
import { entitled } from "../plans.server";
import db from "../db.server";
import { Page, Icon } from "@shopify/polaris";
import {
  ImageMagicIcon,
  MagicIcon,
  AutomationIcon,
  GaugeIcon,
  PlanIcon,
  ImagesIcon,
  LockIcon,
} from "@shopify/polaris-icons";
import { LogoMark, Meter } from "../components/Brand";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  let plan = null;
  try {
    plan = (await getBillingStateCached(admin, session.shop)).plan;
  } catch (e) {
    if (e instanceof Response) throw e; // let re-auth propagate
  }

  let usage = { imagesUsed: 0 };
  let autoOptimize = false;
  try {
    usage = await getUsage(session.shop);
    const settings = await db.shopSettings.findUnique({ where: { shop: session.shop } });
    autoOptimize = settings?.autoOptimize ?? false;
  } catch { /* usage/settings tables not ready — defaults */ }

  return {
    plan: {
      name: plan?.name || "Free",
      tier: plan?.tier || "free",
      monthlyImages: plan?.monthlyImages ?? 100,
      altText: entitled(plan, "altText"),
      pageSpeed: entitled(plan, "pageSpeed"),
      autoOptimizeAllowed: entitled(plan, "autoOptimize"),
    },
    usage,
    autoOptimize,
  };
};

export default function Index() {
  const navigate = useNavigate();
  const { plan, usage, autoOptimize } = useLoaderData();

  const quota = plan.monthlyImages || 0;
  const used = usage?.imagesUsed || 0;
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const fmt = (n) => Number(n).toLocaleString();

  const autoLabel = !plan.autoOptimizeAllowed ? "Not on your plan" : autoOptimize ? "Running" : "Paused";

  // One card per tool on the violet band. Locked tools link to Billing.
  const tools = [
    {
      icon: ImageMagicIcon,
      title: "Compress Images",
      desc: "Re-encode JPEG and PNG product photos as WebP. Gallery order, variant images and the featured photo stay as they were.",
      cta: "Start compressing",
      to: "/app/optimize",
      available: true,
    },
    {
      icon: MagicIcon,
      title: "Alt Text",
      desc: "Get a short, specific description of each product photo, check it, then save it to every image of that product.",
      cta: "Write alt text",
      to: "/app/alt-text",
      available: plan.altText,
      needs: "Starter",
    },
    {
      icon: AutomationIcon,
      title: "Auto-Optimize",
      desc: "Photos on newly created products are compressed for you in the background, with no button to press.",
      cta: "Set it up",
      to: "/app/optimize",
      available: plan.autoOptimizeAllowed,
      needs: "Growth",
    },
    {
      icon: GaugeIcon,
      title: "Page Speed",
      desc: "Test any product page with Google Lighthouse and compare it with the file size you have removed.",
      cta: "Test a page",
      to: "/app/speed",
      available: plan.pageSpeed,
      needs: "Growth",
    },
  ];

  return (
    <Page>
      <div className="pp-status-row">
        <div className="pp-status">
          <span className="pp-status-icon"><Icon source={PlanIcon} /></span>
          <div>
            <p className="pp-status-label">Plan</p>
            <p className="pp-status-value">{plan.name}</p>
          </div>
          <button type="button" className="pp-link" onClick={() => navigate("/app/plan")}>Billing</button>
        </div>
        <div className="pp-status pp-status--wide">
          <span className="pp-status-icon"><Icon source={ImagesIcon} /></span>
          <div className="pp-status-grow">
            <p className="pp-status-label">{`Images this month · ${fmt(used)} of ${fmt(quota)}`}</p>
            <Meter pct={pct} label={`${pct}% of this month's images used`} />
          </div>
        </div>
        <div className="pp-status">
          <span className="pp-status-icon"><Icon source={AutomationIcon} /></span>
          <div>
            <p className="pp-status-label">Auto-Optimize</p>
            <p className="pp-status-value">{autoLabel}</p>
          </div>
        </div>
      </div>

      <header className="pp-intro">
        <span className="pp-brand"><LogoMark size={26} />Pic Pace</span>
        <h1>Product pages that keep pace with your shoppers</h1>
        <p>
          Smaller photos, clear alt text and a page speed check, run from one place in your
          Shopify admin.
        </p>
      </header>

      <section className="pp-band">
        <div className="pp-band-frame">
          {tools.map((t) => (
            <div key={t.title} className={`pp-feature${t.available ? "" : " is-locked"}`}>
              <span className="pp-feature-icon"><Icon source={t.available ? t.icon : LockIcon} /></span>
              <p className="pp-feature-title">{t.title}</p>
              <p className="pp-feature-desc">{t.desc}</p>
              {t.available ? (
                <button type="button" className="pp-btn pp-btn-primary" onClick={() => navigate(t.to)}>{t.cta}</button>
              ) : (
                <button type="button" className="pp-btn pp-btn-outline" onClick={() => navigate("/app/plan")}>{`Unlock with ${t.needs}`}</button>
              )}
            </div>
          ))}
        </div>
      </section>
      <div style={{ height: 24 }} />
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
