import { Icon } from "@shopify/polaris";

// Simple white header bar shown at the top of each feature page. `eyebrow` is
// rendered as a small muted label after the title.
export default function PageHeader({ icon, eyebrow, title, subtitle }) {
  return (
    <div className="pp-page-head">
      <span className="pp-page-head-icon">
        <Icon source={icon} />
      </span>
      <div className="pp-page-head-text">
        <p className="pp-page-head-title">
          {title}
          {eyebrow && <span className="pp-page-head-tag">{eyebrow}</span>}
        </p>
        {subtitle && <p className="pp-page-head-sub">{subtitle}</p>}
      </div>
    </div>
  );
}
