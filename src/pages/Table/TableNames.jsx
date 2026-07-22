import { useState } from "react";
import "./TableNames.css";
import AddTableNameModal from "./AddTableNameModal";

function TableNames() {
  const [showModal, setShowModal] = useState(false);
  const [tableNames, setTableNames] = useState([]);

  const handleSave = (newTableName) => {
    setTableNames([...tableNames, newTableName]);
  };

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Table Name Management</h2>
          <p className="text-muted">
            Manage all table names.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Add Table Name
        </button>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <table className="table table-bordered table-hover align-middle">

            <thead className="table-light">
              <tr>
                <th>Table Name</th>
              </tr>
            </thead>

            <tbody>

              {tableNames.length === 0 ? (
                <tr>
                  <td className="text-center">
                    No Table Names Added
                  </td>
                </tr>
              ) : (
                tableNames.map((table, index) => (
                  <tr key={index}>
                    <td>{table.name}</td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      </div>

      <AddTableNameModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />

    </div>
  );
}

export default TableNames;