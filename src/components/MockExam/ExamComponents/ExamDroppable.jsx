/* eslint-disable react/prop-types */
import { useRef } from "react";
import { useDroppable } from "@dnd-kit/react";
import { Overlay, Tooltip } from "react-bootstrap";
import "./ExamDroppable.css";
import useExamQuestionStore from "./examQuestionStore";
import { useOverlayContainer } from "../ExamShell/useOverlayContainer";

const mergeRefs =
  (...refs) =>
  (node) => {
    refs.forEach((r) => {
      if (typeof r === "function") r(node);
      else if (r && typeof r === "object") r.current = node;
    });
  };

// One aligned table with two transparent drop targets layered over its
// columns - the same layout as Question/Droppable.jsx, instead of the two
// separate tables this used to render. The exam model has no pairing: an
// "add" row shows its amount in the middle column, a "less" row shows
// -amount in the last column, and each placed row keeps a remove control
// rather than a correct/wrong state.
const ExamDroppable = ({
  id,
  addLabel = "Particulars",
  amtLabel = "Amt (₹)",
  isCreditSide,
}) => {
  const data =
    useExamQuestionStore(
      (state) =>
        state.byQuestionId[state.activeQuestionId]?.droppableData?.[id],
    ) || [];
  const removeAnswer = useExamQuestionStore((state) => state.removeAnswer);

  const theme = isCreditSide ? "theme-credit" : "theme-debit";

  // Portal the "Add" / "Less" tooltips into the fullscreen element while the
  // exam is running - parked on document.body they stay in the DOM but the
  // browser never paints them.
  const overlayContainer = useOverlayContainer();

  const addZoneRef = useRef(null);
  const subZoneRef = useRef(null);

  const { ref: addRef, isDropTarget: isAddOver } = useDroppable({
    id: `${id}-add`,
  });
  const { ref: subRef, isDropTarget: isSubOver } = useDroppable({
    id: `${id}-less`,
  });

  const addTotal = data
    .filter((o) => o.operation === "add")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const subTotal = data
    .filter((o) => o.operation === "less")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  return (
    <div className={`exam-droppable ${theme}`}>
      <div className="ed-surface">
        <table className="table table-sm mb-0 ed-table">
          <colgroup>
            <col style={{ width: "44%" }} />
            <col style={{ width: "28%" }} />
            <col style={{ width: "28%" }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">{addLabel}</th>
              <th scope="col" className="text-end">
                {amtLabel}
              </th>
              <th scope="col" className="text-end">
                {amtLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((obj) => (
              <tr key={obj.id} className="placed-row">
                <td className="particulars-cell">
                  {obj.name}
                  <button
                    type="button"
                    className="remove-row-btn"
                    aria-label={`Remove ${obj.name}`}
                    onClick={() => removeAnswer(obj.id)}
                  >
                    ×
                  </button>
                </td>
                <td className="text-end amount-cell">
                  {obj.operation === "add"
                    ? Number(obj.amount).toLocaleString("en-IN")
                    : ""}
                </td>
                <td className="text-end amount-cell">
                  {obj.operation === "less"
                    ? `-${Number(obj.amount).toLocaleString("en-IN")}`
                    : " "}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td className="fw-bold">Total</td>
              <td className="fw-bold text-end amount-cell">
                {addTotal.toLocaleString("en-IN")}
              </td>
              <td className="fw-bold text-end amount-cell">
                {(addTotal - subTotal).toLocaleString("en-IN")}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Transparent drop targets layered over the table columns so the
            table itself stays a single, aligned grid. */}
        <div
          ref={mergeRefs(addRef, addZoneRef)}
          className={`ed-drop-overlay ed-drop-overlay-add ${
            isAddOver ? "is-over" : ""
          }`}
          aria-hidden="true"
        />
        <div
          ref={mergeRefs(subRef, subZoneRef)}
          className={`ed-drop-overlay ed-drop-overlay-sub ${
            isSubOver ? "is-over" : ""
          }`}
          aria-hidden="true"
        />
      </div>

      <Overlay
        target={addZoneRef.current}
        show={isAddOver}
        placement="top"
        container={overlayContainer}
      >
        {(overlayProps) => (
          <Tooltip
            id={`${id}-add-tooltip`}
            className="add-tooltip"
            {...overlayProps}
          >
            Add
          </Tooltip>
        )}
      </Overlay>

      <Overlay
        target={subZoneRef.current}
        show={isSubOver}
        placement="top"
        container={overlayContainer}
      >
        {(overlayProps) => (
          <Tooltip
            id={`${id}-sub-tooltip`}
            className="sub-tooltip"
            {...overlayProps}
          >
            Less
          </Tooltip>
        )}
      </Overlay>
    </div>
  );
};

export default ExamDroppable;
