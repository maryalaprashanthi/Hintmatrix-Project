import { FaEdit, FaTrash } from "react-icons/fa";

function RuleEngineTable({ ruleEngineList, onEdit, onDelete }) {
  return (
    <div className="table-container">
      <table className="rule-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Chapter Name</th>
            <th>Pair Attribute</th>
            <th>Field Name</th>
            <th>Field Type</th>
            <th>Relationship</th>
            <th>Pair Order</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {ruleEngineList.length === 0 ? (
            <tr>
              <td colSpan="9" className="no-data">
                No Rule Engine Records Found.
              </td>
            </tr>
          ) : (
            ruleEngineList.map((rule, index) => (
              <tr key={rule.ruleId}>
                <td>{index + 1}</td>

                <td>{rule.chapterName}</td>

                <td>{rule.pairAttributeName}</td>

                <td>{rule.fieldName}</td>

                <td>{rule.fieldType}</td>

                <td>{rule.relationshipName}</td>

                <td>{rule.pairOrder}</td>

                <td>{rule.activeRow ? "Active" : "Inactive"}</td>

                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => onEdit(rule)}>
                      <FaEdit />
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => onDelete(rule.ruleId)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RuleEngineTable;
