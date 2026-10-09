import PageHeader from "../components/PageHeader";
import { CreditCardIcon } from "@shopify/polaris-icons";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "react-router";
import { authenticate } from "../shopify.server";
import {
  getBillingState,
  managedPricingUrl,
  appBridgeRedirect,
  cancelSubscription,
} from "../billing.server";
import { getUsage } from "../usage.server";
import { PLAN_TIERS } from "../planCatalog";
import { Page, Layout, BlockStack, Banner, Badge } from "@shopify/polaris";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { Meter, CheckGlyph } from "../components/Brand";

// Human labels for the entitlement flags, shown as the current plan's inclusions.
const FEATURE_LABELS = {
  optimize: "Compress Images to WebP",
  altText: "Alt Text",
  autoOptimize: "Auto-Optimize for new products",
  pageSpeed: "Page Speed (Lighthouse)",
};

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  let state = { hasActivePlan: false, plan: null, appHandle: undefined };
  try {
    state = await getBillingState(admin, session.shop);
  } catch (e) {
    if (e instanceof Response) throw e;
  }

  let usage = { imagesUsed: 0 };
  try { usage = await getUsage(session.shop); } catch { /* table not ready */ }

  const plan = state.plan || { name: "Free", tier: "free", monthlyImages: 100, features: {} };
  const included = Object.keys(FEATURE_LABELS).filter((k) => plan.features?.[k]);

  return {
    hasActivePlan: state.hasActivePlan,
    planName: plan.name,
    tier: plan.tier,
    monthlyImages: plan.monthlyImages,
    included,
    imagesUsed: usage.imagesUsed || 0,
    // Direct top-frame link target for the Change/Choose-plan CTA.
    pricingUrl: managedPricingUrl(session.shop, state.appHandle),
  };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  const state = await getBillingState(admin);
  const pricingUrl = managedPricingUrl(session.shop, state.appHandle);

  // Cancel: try the in-app cancel mutation first; if managed pricing blocks it,
  // fall back to the hosted page to cancel manually.
  if (actionType === "cancel") {
    const sub = state.activeSubscription;
    if (!sub) return { cancelled: true };
    try {
      await cancelSubscription(admin, sub.id);
      return { cancelled: true };
    } catch (e) {
      console.error("[BILLING] in-app cancel failed, redirecting:", e?.message);
      throw appBridgeRedirect(pricingUrl);
    }
  }

  return null;
};

export default function BillingPage() {
  const { hasActivePlan, planName, monthlyImages, included, imagesUsed, pricingUrl } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isBusy = navigation.state !== "idle";

  const post = (actionType) => {
    const fd = new FormData();
    fd.append("actionType", actionType);
    submit(fd, { method: "post" });
  };

  const quota = monthlyImages || 0;
  const used = imagesUsed || 0;
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const fmt = (n) => Number(n).toLocaleString();
  const currentIdx = PLAN_TIERS.findIndex((t) => t.name === planName);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <PageHeader icon={CreditCardIcon} title="Billing" subtitle="Your subscription, this month's image count and what each plan includes" />
        </Layout.Section>

        {actionData?.cancelled && !hasActivePlan && (
          <Layout.Section>
            <Banner title="Subscription cancelled" tone="info">
              You're now on the Free plan. You can choose a paid plan again at any time.
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <BlockStack gap="400">
            <div className="pp-card pp-summary">
              <div className="pp-summary-head">
                <div>
                  <p className="pp-summary-label">Current plan</p>
                  <p className="pp-summary-plan">
                    {planName}
                    <Badge tone={hasActivePlan ? "success" : undefined}>{hasActivePlan ? "Subscribed" : "No paid plan"}</Badge>
                  </p>
                </div>
                <div className="pp-actions">
                  <a className="pp-btn pp-btn-primary" href={pricingUrl} target="_top">
                    {hasActivePlan ? "Switch plan" : "See paid plans"}
                  </a>
                  {hasActivePlan && (
                    <button type="button" className="pp-btn pp-btn-outline" disabled={isBusy} onClick={() => post("cancel")}>
                      {isBusy ? "Cancelling…" : "Cancel subscription"}
                    </button>
                  )}
                </div>
              </div>
              <div className="pp-summary-usage">
                <div className="pp-summary-usage-row">
                  <span>Images compressed this month</span>
                  <strong>{`${fmt(used)} / ${fmt(quota)}`}</strong>
                </div>
                <Meter pct={pct} label={`${pct}% of monthly images used`} />
                <p className="pp-summary-note">{`${fmt(Math.max(0, quota - used))} left. The count starts again on the 1st of each month (UTC).`}</p>
              </div>
              <div className="pp-pills">
                {Object.entries(FEATURE_LABELS).map(([k, label]) => {
                  const on = included.includes(k);
                  return (
                    <span key={k} className={`pp-pill${on ? "" : " is-off"}`}>
                      <CheckGlyph />{label}{!on && " · upgrade"}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="pp-card">
              <p className="pp-card-title">Compare plans</p>
              <p className="pp-card-sub">Monthly price shown. Paying yearly costs about 17% less.</p>
              <div className="pp-compare" role="table" aria-label="Plan comparison">
                <div className="pp-compare-row pp-compare-head" role="row">
                  <span role="columnheader">Plan</span>
                  <span role="columnheader">Price</span>
                  <span role="columnheader">Images / month</span>
                  <span role="columnheader">Best for</span>
                </div>
                {PLAN_TIERS.map((t, i) => (
                  <div key={t.name} role="row" className={`pp-compare-row${i === currentIdx ? " is-current" : ""}`}>
                    <span role="cell" className="pp-compare-name">
                      {t.name}
                      {i === currentIdx && <span className="pp-tag">Current</span>}
                    </span>
                    <span role="cell">{t.price === 0 ? "$0" : `$${t.price}/mo`}</span>
                    <span role="cell">{t.images}</span>
                    <span role="cell" className="pp-compare-muted">{t.tagline}</span>
                  </div>
                ))}
              </div>
              <p className="pp-footnote">
                Charges appear on your Shopify invoice. Plan changes show up here automatically.
              </p>
            </div>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
