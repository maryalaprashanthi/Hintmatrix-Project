/* eslint-disable react/prop-types */
import { CircleX, Lightbulb } from "lucide-react";

// Shown when a trial-balance / transaction row on the left is clicked: the
// attribute's own Rule Engine hint text(s), plus each wrong line the
// candidate submitted for it on this attempt - read straight off
// answer_events.description, not a synthesised explanation of what's missing.
const AttributeMistakePanel = ({ status, hints, mistakes }) => {
  if (status === "loading") {
    return <div className="attr-mistake attr-mistake--status">Loading…</div>;
  }

  if (status === "error") {
    return (
      <div className="attr-mistake attr-mistake--status" role="alert">
        Couldn&rsquo;t load this item&rsquo;s detail.
      </div>
    );
  }

  return (
    <div className="attr-mistake">
      {hints.length > 0 && (
        <div className="attr-mistake__hint">
          <div className="attr-mistake__hint-title">
            <Lightbulb size={18} aria-hidden="true" /> Hint
          </div>
          {hints.map((hint, index) => (
            <p key={index}>{hint}</p>
          ))}
        </div>
      )}

      <div className="attr-mistake__wrong">
        <div className="attr-mistake__wrong-title">
          <CircleX size={18} aria-hidden="true" /> What went wrong?
        </div>
        {mistakes.length === 0 ? (
          <p className="attr-mistake__empty">
            No incorrect attempts recorded for this item.
          </p>
        ) : (
          <ul>
            {mistakes.map((mistake, index) => (
              <li key={index}>{mistake}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AttributeMistakePanel;
