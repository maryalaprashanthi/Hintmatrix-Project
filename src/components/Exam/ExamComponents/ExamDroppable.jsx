/* eslint-disable react/prop-types */
import { useRef } from "react";
import { useDroppable } from "@dnd-kit/react";
import { Overlay, Tooltip } from "react-bootstrap";
import "./ExamDroppable.css";
import useExamQuestionStore from "./examQuestionStore";
import { finalAccountParticular } from "../../Question/SampleData";
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
// columns. Derived balancing/transfer rows are view-only; editable placements
// remain the candidate's answers and never reveal correctness.
const ExamDroppable = ({
  id,
  addLabel = "Particulars",
  amtLabel = "Amt (₹)",
  isCreditSide,
  derivedRows = [],
  calculatedTotal,
  matchRowCount,
}) => {
  const data =
    useExamQuestionStore(
      (state) =>
        state.byQuestionId[state.activeQuestionId]?.droppableData?.[id],
    ) || [];
  const removeAnswer = useExamQuestionStore((state) => state.removeAnswer);
  const updatePlacementAmount = useExamQuestionStore((state) => state.updatePlacementAmount);
  const displayRows = [...data, ...derivedRows];

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

  const addTotal = displayRows
    .filter((o) => o.operation === "add")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const subTotal = displayRows
    .filter((o) => o.operation === "less")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const blankRows = Math.max(0, (matchRowCount ?? displayRows.length) - displayRows.length);

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
            {displayRows.map((obj) => (
              <tr key={`${obj.id}-${obj.operation}`} className={obj.derived ? "derived-row" : "placed-row"}>
                <td className="particulars-cell">
                  {finalAccountParticular(obj, id)}
                  {!obj.derived && <button
                    type="button"
                    className="remove-row-btn"
                    aria-label={`Remove ${obj.name}`}
                    onClick={() => removeAnswer(obj.id, `${id}-${obj.operation}`)}
                  >
                    ×
                  </button>}
                </td>
                <td className="text-end amount-cell">
                  {obj.operation === "add" && !obj.derived && <input type="number" min="0" step="0.01"
                        className="ed-amount-input"
                        aria-label={`Amount for ${obj.name} on ${id}`}
                        value={obj.amount}
                        onChange={(event) => updatePlacementAmount(obj.id, `${id}-${obj.operation}`, event.target.value)}
                      />}
                </td>
                <td className="text-end amount-cell">
                  {obj.derived
                    ? `${obj.operation === "less" && Number(obj.amount) !== 0 ? "-" : ""}${Number(obj.amount).toLocaleString("en-IN", Number(obj.amount) === 0 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {})}`
                    : obj.operation === "less" && <label className="d-flex align-items-center justify-content-end">
                        <span aria-hidden="true">−</span>
                        <input type="number" min="0" step="0.01"
                          className="ed-amount-input"
                          aria-label={`Deduction for ${obj.name} on ${id}`}
                          value={obj.amount}
                          onChange={(event) => updatePlacementAmount(obj.id, `${id}-${obj.operation}`, event.target.value)}
                        />
                      </label>}
                </td>
              </tr>
            ))}
            {Array.from({ length: blankRows }, (_, index) => (
              <tr key={`${id}-blank-${index}`} className="blank-row" aria-hidden="true">
                <td>&nbsp;</td><td /><td />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td className="fw-bold">Total</td>
              <td />
              <td className="fw-bold text-end amount-cell">
                {(calculatedTotal ?? addTotal - subTotal).toLocaleString("en-IN")}
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
