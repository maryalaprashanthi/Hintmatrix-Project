import { useRef } from "react";
import { useDroppable } from "@dnd-kit/react";
import { Overlay, Tooltip } from "react-bootstrap";
import "./Droppable.css";
import useQuestionStore from "./questionStore";

const mergeRefs =
  (...refs) =>
  (node) => {
    refs.forEach((r) => {
      if (typeof r === "function") r(node);
      else if (r && typeof r === "object") r.current = node;
    });
  };

const Droppable = ({
  id,
  addLabel = "Particulars",
  amtLabel = "Amt (₹)",
  isCreditSide,
}) => {
  const data = useQuestionStore((state) => state.droppableData[id]);
  // console.log("I am rendering Droppable for id: ", id);
  // console.log(
  //   "This is data I am getting in component Droppable for id: ",
  //   id,
  //   " and data is ",
  //   data,
  // );
  // const temp = questions.filter((q) =>
  //   q.answered.some((tar) => tar.startsWith(`${id}-`)),
  // );

  // const data = temp.map((q) => {
  //   for (let tar of q.answered) {
  //     if (tar.startsWith(`${id}-`) && tar.split("-").pop() == "add") {
  //       // console.log("I entered + with value: ", tar.split("-").pop());
  //       return { ...q, operation: "+" };
  //     } else if (tar.startsWith(`${id}-`) && tar.split("-").pop() == "less") {
  //       // console.log("I entered - with value: ", tar.split("-").pop());
  //       return { ...q, operation: "-" };
  //     }
  //   }
  // });

  // console.log("This is data I got for id: ", id, " and data is ", data);

  // const isCreditSide = /(Credit Particulars|assets)$/i.test(id || "");

  const theme = isCreditSide ? "theme-credit" : "theme-debit";

  const addZoneRef = useRef(null);
  const subZoneRef = useRef(null);

  const { ref: addRef, isDropTarget: isAddOver } = useDroppable({
    id: `${id}-add`,
  });
  const { ref: subRef, isDropTarget: isSubOver } = useDroppable({
    id: `${id}-less`,
  });

  const addTotal = (data || [])
    .filter((o) => o.operation === "add")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const subTotal = (data || [])
    .filter((o) => o.operation === "less")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const calcSum = (id, pairId) => {
    const addObj = data.find((o) => o.id === pairId && o.operation === "add");
    const subObj = data.find((o) => o.id === id && o.operation === "less");
    return addObj && subObj
      ? Number(addObj.amount || 0) - Number(subObj.amount || 0)
      : 0;
  };
  console.log("All data is ", data);
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
              {data !== undefined &&
                data.map((obj) => (
                  <tr key={`${obj.id}-add`}>
                    <td>{obj.name}</td>
                    <td className="text-end">
                      {obj.operation === "add"
                        ? Number(obj.amount).toLocaleString("en-IN")
                        : obj.isPaired
                          ? `-${Number(obj.amount).toLocaleString("en-IN")}`
                          : ""}
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td className="fw-bold">Total</td>
                <td className="fw-bold text-end">
                  {/* {addTotal.toLocaleString("en-IN")} */}
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
              {data !== undefined &&
                data.map((obj) => (
                  <tr key={`${obj.id}-less`}>
                    <td className="text-end">
                      {obj.operation === "less" && !obj.isPaired
                        ? `-${Number(obj.amount).toLocaleString("en-IN")}`
                        : obj.operation === "less" && obj.isPaired
                          ? calcSum(obj.id, obj.pairId)
                          : "\u00A0"}
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

export default Droppable;
