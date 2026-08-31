import { useRef } from "react";
import { useDroppable } from "@dnd-kit/react";
import { Overlay, Tooltip } from "react-bootstrap";
import "./ExamDroppable.css";
import useExamQuestionStore from "./examQuestionStore";

const mergeRefs =
  (...refs) =>
  (node) => {
    refs.forEach((r) => {
      if (typeof r === "function") r(node);
      else if (r && typeof r === "object") r.current = node;
    });
  };

// Matches the 3-column layout from Question/Droppable.jsx: one shared
// "Particulars" name column (always in the add zone) plus one amount column
// per zone, with both zones iterating the same row list so they stay
// visually aligned - not a separate name column per zone.
const ExamDroppable = ({
  id,
  addLabel = "Particulars",
  amtLabel = "Amt (₹)",
  isCreditSide,
}) => {
  const data = useExamQuestionStore((state) => state.droppableData[id]) || [];
  const removeAnswer = useExamQuestionStore((state) => state.removeAnswer);

  const theme = isCreditSide ? "theme-credit" : "theme-debit";

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
    <div className={`droppable-group ${theme}`}>
      <div className="row g-0">
        <div
          ref={mergeRefs(addRef, addZoneRef)}
          className={`dropzone add-zone col-12 col-sm-8 ${isAddOver ? "active-dropzone-add" : ""}`}
        >
          <table className="table table-sm mb-0 dropzone-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: "70%" }}>
                  {addLabel}
                </th>
                <th scope="col" style={{ width: "30%" }} className="text-end">
                  {amtLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((obj) => (
                <tr key={`${obj.id}-add`} className="placed-row">
                  <td>{obj.name}</td>
                  <td className="text-end">
                    {obj.operation === "add" ? (
                      <>
                        {Number(obj.amount).toLocaleString("en-IN")}
                        <button
                          type="button"
                          className="remove-row-btn"
                          aria-label={`Remove ${obj.name}`}
                          onClick={() => removeAnswer(obj.id)}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td className="fw-bold">Total</td>
                <td className="fw-bold text-end">
                  {addTotal.toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <Overlay target={addZoneRef.current} show={isAddOver} placement="top">
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

        <div
          ref={mergeRefs(subRef, subZoneRef)}
          className={`dropzone sub-zone col-12 col-sm-4 ${isSubOver ? "active-dropzone-sub" : ""}`}
        >
          <table className="table table-sm mb-0 dropzone-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: "100%" }} className="text-end">
                  {amtLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((obj) => (
                <tr key={`${obj.id}-less`} className="placed-row">
                  <td className="text-end">
                    {obj.operation === "less" ? (
                      <>
                        -{Number(obj.amount).toLocaleString("en-IN")}
                        <button
                          type="button"
                          className="remove-row-btn"
                          aria-label={`Remove ${obj.name}`}
                          onClick={() => removeAnswer(obj.id)}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      " "
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td className="fw-bold text-end">
                  {(addTotal - subTotal).toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <Overlay target={subZoneRef.current} show={isSubOver} placement="top">
          {(overlayProps) => (
            <Tooltip
              id={`${id}-sub-tooltip`}
              className="add-tooltip"
              {...overlayProps}
            >
              Less
            </Tooltip>
          )}
        </Overlay>
      </div>
    </div>
  );
};

export default ExamDroppable;
