/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import "./Breadcrumbs.css";

// Dumb trail renderer. Pass `items` as [{ label, to }] parent-to-current;
// the last item renders as plain text (the current page), the rest as links.
// Items with no `label` yet (a name still loading) are skipped.
export default function Breadcrumbs({ items = [] }) {
  const trail = items.filter((item) => item && item.label);

  if (trail.length === 0) return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {trail.map((item, index) => {
        const isLast = index === trail.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="breadcrumbs__item">
            {isLast || !item.to ? (
              <span className="breadcrumbs__current">{item.label}</span>
            ) : (
              <Link to={item.to} className="breadcrumbs__link">
                {item.label}
              </Link>
            )}
            {!isLast && <span className="breadcrumbs__sep">›</span>}
          </span>
        );
      })}
    </nav>
  );
}
